import mongoose from 'mongoose'
import Product from '../models/Product.js'
import User from '../models/User.js'

export const VENDOR_DELIVERY_RADIUS_KM = 10

function getPayout(distanceKm) {
  const baseFare = Number(process.env.DELIVERY_PARTNER_BASE_FARE || 20)
  const perKm = Number(process.env.DELIVERY_PARTNER_PER_KM || 8)
  return Math.round(baseFare + distanceKm * perKm)
}

async function getGoogleRouteDistance(origin, destination, pickupAddresses) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    const error = new Error('Delivery distance checks require GOOGLE_MAPS_API_KEY.')
    error.status = 503
    throw error
  }
  const asWaypoint = (value) => typeof value === 'string'
    ? { address: value }
    : {
        location: {
          latLng: { latitude: value.latitude, longitude: value.longitude },
        },
      }

  let response
  let data
  try {
    response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.legs.distanceMeters',
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        origin: asWaypoint(origin),
        destination: asWaypoint(destination),
        intermediates: pickupAddresses.map((address) => ({ address })),
        travelMode: 'DRIVE',
      }),
    })
    data = await response.json()
  } catch (cause) {
    const error = new Error('Google Routes could not verify this delivery distance.')
    error.status = 503
    error.cause = cause
    throw error
  }
  if (!response.ok) {
    const googleError = data.error
    const isPermissionError =
      response.status === 403 ||
      googleError?.status === 'PERMISSION_DENIED' ||
      /requests to this api .* are blocked|api has not been used|api is disabled/i.test(googleError?.message || '')
    const message = isPermissionError
      ? 'Google Routes denied the request. Enable the Routes API and billing in the Google Cloud project, allow Routes API in the key restrictions, and use a server key restriction rather than an HTTP referrer restriction.'
      : googleError?.message || `Google Routes request failed (${response.status}).`
    const error = new Error(message)
    error.status = 503
    throw error
  }
  const route = data.routes?.[0]
  if (!data.routes?.length) {
    const error = new Error('Google Routes did not find a driving route.')
    error.status = 422
    throw error
  }
  const rawMeters = route.distanceMeters ?? route.distance_meters
  const legDistances = route.legs?.map((leg) => leg.distanceMeters ?? leg.distance_meters)
  const legMeters = legDistances?.length && legDistances.every((distance) =>
    Number.isFinite(typeof distance === 'string' ? Number(distance) : distance),
  )
    ? legDistances.reduce((sum, distance) => sum + Number(distance), 0)
    : NaN
  const meters = typeof rawMeters === 'number'
    ? rawMeters
    : typeof rawMeters === 'string' && rawMeters.trim()
      ? Number(rawMeters)
      : Number.isFinite(legMeters)
        ? legMeters
        : route.duration === '0s' && route.legs?.length
          ? 0
          : NaN
  if (!Number.isFinite(meters) || meters < 0) {
    console.error('Google Routes response did not include distanceMeters.', {
      responseFields: Object.keys(data),
      routeFields: Object.keys(route || {}),
      legsCount: route.legs?.length || 0,
    })
    const error = new Error('Google Routes did not return a valid delivery distance.')
    error.status = 503
    throw error
  }
  return Math.round((meters / 1000) * 10) / 10
}

async function getPickupAddresses(order) {
  const vendorIds = [...new Set(order.items.map((item) => item.vendor?.toString()).filter(Boolean))]
  if (!vendorIds.length || vendorIds.some((id) => !mongoose.isValidObjectId(id))) {
    throw new Error('This order has no valid vendor pickup location.')
  }
  const vendors = await User.find({ _id: { $in: vendorIds }, role: 'vendor' }).select('address city state pincode')
  const vendorById = new Map(vendors.map((vendor) => [vendor._id.toString(), vendor]))
  return vendorIds.map((id) => {
    const vendor = vendorById.get(id)
    if (!vendor) {
      const error = new Error('A vendor pickup location is unavailable.')
      error.status = 422
      throw error
    }
    const missingFields = getMissingPickupFields(vendor)
    if (missingFields.length) {
      const error = new Error(
        `A vendor must complete their pickup location (${missingFields.join(', ')}) before delivery distance can be checked.`,
      )
      error.status = 422
      throw error
    }
    return formatVendorAddress(vendor)
  })
}

function formatVendorAddress(vendor) {
  return [vendor.address, vendor.city, vendor.state, vendor.pincode].filter(Boolean).join(', ')
}

function normalizeAddress(address) {
  return address
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function getMissingPickupFields(vendor) {
  return [
    ['address', 'street address'],
    ['city', 'city'],
    ['state', 'state'],
    ['pincode', 'PIN code'],
  ]
    .filter(([field]) => !vendor[field]?.trim())
    .map(([, label]) => label)
}

export async function getVendorDeliveryDistances(vendors, destination) {
  const results = []
  const vendorsWithAddress = []

  for (const vendor of vendors) {
    const missingFields = getMissingPickupFields(vendor)
    if (missingFields.length) {
      results.push({
        vendorId: vendor._id,
        name: vendor.businessName || vendor.name,
        distanceKm: null,
        deliverable: false,
        reason: `Pickup location is incomplete (${missingFields.join(', ')}).`,
      })
      continue
    }
    const address = formatVendorAddress(vendor)
    vendorsWithAddress.push({ vendor, address })
  }

  for (let index = 0; index < vendorsWithAddress.length; index += 5) {
    const batch = vendorsWithAddress.slice(index, index + 5)
    const distances = await Promise.all(batch.map(async ({ vendor, address }) => {
      try {
        const sameAddress =
          typeof destination === 'string' &&
          normalizeAddress(address) === normalizeAddress(destination)
        const distanceKm = sameAddress ? 0 : await getGoogleRouteDistance(address, destination, [])
        return {
          vendorId: vendor._id,
          name: vendor.businessName || vendor.name,
          distanceKm,
          deliverable: distanceKm <= VENDOR_DELIVERY_RADIUS_KM,
          reason: distanceKm <= VENDOR_DELIVERY_RADIUS_KM
            ? ''
            : `Vendor is ${distanceKm} km away; the delivery limit is ${VENDOR_DELIVERY_RADIUS_KM} km.`,
        }
      } catch (error) {
        if (error.status === 422) {
          return {
            vendorId: vendor._id,
            name: vendor.businessName || vendor.name,
            distanceKm: null,
            deliverable: false,
            reason: 'No driving route is available.',
          }
        }
        throw error
      }
    }))
    results.push(...distances)
  }

  return results
}

export async function getProductVendorDeliveryDistances(productIds, destination) {
  const uniqueProductIds = [...new Set(productIds)]
  if (uniqueProductIds.some((id) => !mongoose.isValidObjectId(id))) {
    const error = new Error('One or more product IDs are invalid.')
    error.status = 400
    throw error
  }
  const products = await Product.find({ _id: { $in: uniqueProductIds }, status: 'Active' })
    .populate({
      path: 'vendor',
      match: { role: 'vendor', status: 'Active' },
      select: 'name businessName address city state pincode',
    })
  if (products.length !== uniqueProductIds.length) {
    const error = new Error('One or more products are unavailable.')
    error.status = 404
    throw error
  }
  const vendors = [...new Map(
    products
      .filter((product) => product.vendor)
      .map((product) => [product.vendor._id.toString(), product.vendor]),
  ).values()]
  if (!vendors.length) {
    const error = new Error('No vendor delivery locations are available for these products.')
    error.status = 409
    throw error
  }
  return getVendorDeliveryDistances(vendors, destination)
}

export async function calculateDeliveryQuote(productIds, customerLocation) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    const error = new Error('Add at least one product before calculating delivery.')
    error.status = 400
    throw error
  }
  if (
    !Number.isFinite(customerLocation?.latitude) ||
    customerLocation.latitude < -90 ||
    customerLocation.latitude > 90 ||
    !Number.isFinite(customerLocation?.longitude) ||
    customerLocation.longitude < -180 ||
    customerLocation.longitude > 180
  ) {
    const error = new Error('A valid customer GPS location is required for distance-based delivery pricing.')
    error.status = 400
    throw error
  }
  const uniqueProductIds = [...new Set(productIds)]
  if (uniqueProductIds.some((id) => !mongoose.isValidObjectId(id))) {
    const error = new Error('One or more product IDs are invalid.')
    error.status = 400
    throw error
  }
  const products = await Product.find({
    _id: { $in: uniqueProductIds },
    status: 'Active',
  }).select('vendor')
  if (products.length !== uniqueProductIds.length) {
    const error = new Error('One or more products are unavailable.')
    error.status = 404
    throw error
  }
  const pickupAddresses = await getPickupAddresses({
    items: products.map((product) => ({ vendor: product.vendor })),
  })
  let distanceKm
  try {
    distanceKm = await getGoogleRouteDistance(
      pickupAddresses[0],
      customerLocation,
      pickupAddresses.slice(1),
    )
  } catch (error) {
    if (!error.status) error.status = 503
    throw error
  }
  const fee = Math.round(getPayout(distanceKm))
  return { distanceKm, deliveryFee: fee, partnerEarnings: fee }
}
