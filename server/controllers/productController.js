import Product from '../models/Product.js'
import User from '../models/User.js'
import { notifyWaitingCustomers } from '../utils/stockNotifications.js'
import { createNotification } from '../utils/notifications.js'

function parseDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getProductFreshnessState(product) {
  const baseScore = Number(product.freshnessScore ?? 85)
  const harvestDate = parseDate(product.harvestDate)
  const expiryDate = parseDate(product.expiryDate || product.expiryCountdown)
  const today = new Date()

  let daysLeft = 0
  let qualityDrop = 0

  if (expiryDate && harvestDate) {
    const totalShelfDays = Math.max(1, Math.ceil((expiryDate - harvestDate) / 86400000))
    const elapsedDays = Math.max(0, Math.ceil((today - harvestDate) / 86400000))
    daysLeft = Math.max(0, Math.ceil((expiryDate - today) / 86400000))
    qualityDrop = (elapsedDays / totalShelfDays) * 60
  } else if (harvestDate) {
    const elapsedDays = Math.max(0, Math.ceil((today - harvestDate) / 86400000))
    const shelfWindow = Math.max(5, Number(product.shelfLife ? Number.parseInt(String(product.shelfLife).match(/\d+/)?.[0] ?? '5', 10) : 5))
    daysLeft = Math.max(0, shelfWindow - elapsedDays)
    qualityDrop = (elapsedDays / Math.max(1, shelfWindow)) * 55
  } else {
    const elapsedDays = Math.max(0, Math.ceil((today - new Date(product.createdAt || Date.now())) / 86400000))
    daysLeft = Math.max(0, 6 - elapsedDays)
    qualityDrop = (elapsedDays / 6) * 30
  }

  const liveFreshnessScore = Math.max(0, Math.min(100, Math.round(baseScore - qualityDrop)))
  let freshnessLabel = 'Excellent'
  if (liveFreshnessScore < 70) freshnessLabel = 'Good'
  if (liveFreshnessScore < 55) freshnessLabel = 'Fair'
  if (liveFreshnessScore < 40) freshnessLabel = 'Poor'

  const donationRecommended = daysLeft <= 2 || liveFreshnessScore < 45
  const freshnessReason = donationRecommended
    ? 'Freshness is declining quickly and donation should be considered soon.'
    : 'Freshness remains in a safe range for sale.'

  return {
    liveFreshnessScore,
    daysLeft,
    donationRecommended,
    freshnessLabel,
    freshnessReason,
  }
}

function withFreshness(product) {
  const value = typeof product?.toObject === 'function' ? product.toObject() : { ...product }
  const state = getProductFreshnessState(value)
  return {
    ...value,
    freshnessScore: state.liveFreshnessScore,
    freshnessLabel: state.freshnessLabel,
    freshnessReason: product.freshnessReason || state.freshnessReason,
    daysLeft: state.daysLeft,
    donationRecommended: state.donationRecommended,
  }
}

async function maybeSendDonationAlert(vendorId, product) {
  const state = getProductFreshnessState(product)
  if (!state.donationRecommended || !vendorId || !product || product.stock <= 0) return
  if (product.donationAlertSentAt) {
    const lastSent = new Date(product.donationAlertSentAt)
    const hoursSince = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60)
    if (hoursSince < 24) return
  }

  await Product.updateOne({ _id: product._id }, { donationAlertSentAt: new Date() })
  await createNotification({
    userId: vendorId,
    type: 'donation',
    title: 'Donation alert: near expiry',
    message: `${product.name} is nearing expiry (${state.daysLeft} day${state.daysLeft === 1 ? '' : 's'} left, freshness ${state.liveFreshnessScore}/100). Consider donating it to an NGO.`,
    link: 'donations',
  })
}

function scoreFromMetadata({ category, harvestDate, expiryDate, name, image }) {
  const base = 83
  const categoryBoost = category === 'Vegetables' ? 4 : category === 'Fruits' ? 2 : 0
  const harvestWindow = harvestDate ? Math.max(1, Math.ceil((new Date() - new Date(harvestDate)) / 86400000)) : 0
  const expiryWindow = expiryDate && harvestDate ? Math.max(1, Math.ceil((new Date(expiryDate) - new Date(harvestDate)) / 86400000)) : 5
  const agingPenalty = harvestWindow > 0 ? Math.min(18, (harvestWindow / Math.max(1, expiryWindow)) * 18) : 0
  const imageBoost = image ? 4 : 0
  const namePenalty = /(ripened|overripe|damaged|bruised|wilted)/i.test(name || '') ? 10 : 0
  const score = Math.max(45, Math.min(98, Math.round(base + categoryBoost + imageBoost - agingPenalty - namePenalty)))

  if (score >= 85) return { score, reason: 'Produce looks fresh and market-ready with strong color and shelf-life potential.' }
  if (score >= 70) return { score, reason: 'Produce is in good condition, but the quality is beginning to fade.' }
  if (score >= 55) return { score, reason: 'Condition is fair; arrange faster sale or prepare for donation soon.' }
  return { score, reason: 'Produce is nearing the end of its freshness window and should be prioritized for donation or quick sale.' }
}

export async function scanFreshness(req, res) {
  try {
    const { name, category, harvestDate, expiryDate, image, freshnessScore } = req.body || {}
    const baseValue = Number.isFinite(Number(freshnessScore)) ? Number(freshnessScore) : undefined
    const estimated = scoreFromMetadata({ category, harvestDate, expiryDate, name, image })
    const score = baseValue !== undefined ? Math.max(0, Math.min(100, Math.round((estimated.score * 0.7) + (baseValue * 0.3)) )) : estimated.score
    const expiry = parseDate(expiryDate) || parseDate(harvestDate)
    const daysLeft = expiry ? Math.max(0, Math.ceil((expiry - new Date()) / 86400000)) : 0

    res.json({
      score,
      label: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 55 ? 'Fair' : 'Poor',
      reason: estimated.reason,
      daysLeft,
      recommendedDonation: daysLeft <= 2 || score < 45,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/products — Public browse, supports category, search, organic, sort
export async function getProducts(req, res) {
  try {
    const { category, search, organic, sort } = req.query
    const filter = { status: 'Active' }

    if (category && category !== 'All' && category !== 'Organic') {
      filter.category = category
    }

    if (organic === 'true' || category === 'Organic') {
      filter.organic = true
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { vendorName: { $regex: search, $options: 'i' } },
      ]
    }

    let query = Product.find(filter)

    if (sort === 'price_asc') query = query.sort({ discountedPrice: 1 })
    else if (sort === 'price_desc') query = query.sort({ discountedPrice: -1 })
    else if (sort === 'freshness') query = query.sort({ freshnessScore: -1 })
    else if (sort === 'discount') query = query.sort({ discount: -1 })
    else query = query.sort({ createdAt: -1 })

    const products = await query.exec()
    res.json(products.map(withFreshness))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/products/:id
export async function getProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'name businessName phone address')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(withFreshness(product.toObject ? product.toObject() : product))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/vendor/inventory — Vendor's own products
export async function getVendorInventory(req, res) {
  try {
    const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 })
    const enriched = products.map((product) => withFreshness(product.toObject ? product.toObject() : product))
    await Promise.allSettled(enriched.map((product) => maybeSendDonationAlert(req.user._id, product)))
    res.json(enriched)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/products — Vendor creates product
export async function createProduct(req, res) {
  try {
    const vendor = await User.findById(req.user._id).select(
      'businessName phone address city state pincode paymentDetails',
    )
    const missingVendorDetails = [
      ['businessName', 'business name'],
      ['phone', 'contact phone'],
      ['address', 'pickup street address'],
      ['city', 'pickup city'],
      ['state', 'pickup state'],
      ['pincode', 'pickup PIN code'],
    ].filter(([field]) => !vendor?.[field]?.trim()).map(([, label]) => label)
    if (!vendor?.paymentDetails?.upiId) missingVendorDetails.push('UPI ID')
    if (!vendor?.paymentDetails?.qrCodeUrl) missingVendorDetails.push('payment QR code')
    if (missingVendorDetails.length) {
      return res.status(400).json({
        message: `Complete vendor setup before adding products: ${missingVendorDetails.join(', ')}.`,
      })
    }

    const {
      name,
      category,
      image,
      stock,
      originalPrice,
      discountedPrice,
      unit,
      organic,
      description,
      harvestDate,
      expiryCountdown,
      shelfLife,
      freshnessScore,
      freshnessReason,
      freshnessSource,
    } = req.body

    if (!name || !image || originalPrice === undefined || discountedPrice === undefined || stock === undefined || !unit || freshnessScore === undefined) {
      return res.status(400).json({ message: 'Name, uploaded image, prices, stock, unit, and vendor-reported freshness are required.' })
    }

    const orig = Number(originalPrice)
    const disc = Number(discountedPrice)
    const stockValue = Number(stock)
    const freshnessValue = Number(freshnessScore)
    if (!Number.isFinite(orig) || orig <= 0 || !Number.isFinite(disc) || disc < 0 || disc > orig) {
      return res.status(400).json({ message: 'Enter valid prices; discounted price must not exceed original price.' })
    }
    if (!Number.isInteger(stockValue) || stockValue < 0) {
      return res.status(400).json({ message: 'Stock must be a non-negative whole number.' })
    }
    if (!Number.isFinite(freshnessValue) || freshnessValue < 0 || freshnessValue > 100) {
      return res.status(400).json({ message: 'Freshness score must be between 0 and 100.' })
    }
    const discount = orig > 0 && disc < orig ? Math.round(((orig - disc) / orig) * 100) : 0

    const product = await Product.create({
      name: name.trim(),
      category: category || 'Fruits',
      image,
      vendor: req.user._id,
      vendorName: req.user.businessName || req.user.name,
      stock: stockValue,
      originalPrice: orig,
      discountedPrice: disc,
      discount,
      unit: unit || 'kg',
      organic: Boolean(organic),
      description: description || '',
      harvestDate: harvestDate || undefined,
      expiryCountdown: expiryCountdown || undefined,
      expiryDate: expiryCountdown || undefined,
      shelfLife: shelfLife || undefined,
      freshnessScore: freshnessValue,
      freshnessSource: freshnessSource || 'manual',
      freshnessReason: freshnessReason || '',
      freshnessLastCheckedAt: new Date(),
      status: 'Active',
    })

    await maybeSendDonationAlert(req.user._id, product.toObject ? product.toObject() : product)
    res.status(201).json(withFreshness(product.toObject ? product.toObject() : product))
  } catch (err) {
    console.error('Create product error:', err)
    res.status(400).json({ message: err.message })
  }
}

// PATCH /api/products/:id — Vendor updates product
export async function updateProduct(req, res) {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.user._id })
    if (!product) {
      return res.status(404).json({ message: 'Product not found or does not belong to your account' })
    }

    const allowedFields = [
      'name', 'category', 'image', 'stock', 'originalPrice', 'discountedPrice',
      'unit', 'organic', 'description', 'harvestDate', 'expiryCountdown', 'expiryDate',
      'shelfLife', 'freshnessScore', 'tags', 'status', 'freshnessReason', 'freshnessSource',
    ]
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    )

    if (updates.stock !== undefined && (!Number.isInteger(Number(updates.stock)) || Number(updates.stock) < 0)) {
      return res.status(400).json({ message: 'Stock must be a non-negative whole number.' })
    }
    if (updates.freshnessScore !== undefined && (!Number.isFinite(Number(updates.freshnessScore)) || Number(updates.freshnessScore) < 0 || Number(updates.freshnessScore) > 100)) {
      return res.status(400).json({ message: 'Freshness score must be between 0 and 100.' })
    }
    if (updates.originalPrice !== undefined || updates.discountedPrice !== undefined) {
      const orig = Number(updates.originalPrice !== undefined ? updates.originalPrice : product.originalPrice)
      const disc = Number(updates.discountedPrice !== undefined ? updates.discountedPrice : product.discountedPrice)
      updates.discount = orig > 0 && disc < orig ? Math.round(((orig - disc) / orig) * 100) : 0
    }

    const wasOutOfStock = product.stock === 0
    Object.assign(product, updates)
    if (updates.freshnessScore !== undefined) product.freshnessLastCheckedAt = new Date()
    await product.save()
    if (wasOutOfStock && product.stock > 0) {
      await notifyWaitingCustomers(product).catch((err) => {
        console.error('Restock notification error:', err.message)
      })
    }
    await maybeSendDonationAlert(req.user._id, product.toObject ? product.toObject() : product)
    res.json(withFreshness(product.toObject ? product.toObject() : product))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PATCH /api/products/:id/stock — Quick stock update
export async function updateStock(req, res) {
  try {
    const { stock } = req.body
    if (stock === undefined || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: 'Valid stock number is required' })
    }

    const product = await Product.findOne({ _id: req.params.id, vendor: req.user._id })
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const wasOutOfStock = product.stock === 0
    product.stock = Number(stock)
    await product.save()
    if (wasOutOfStock && product.stock > 0) {
      await notifyWaitingCustomers(product).catch((err) => {
        console.error('Restock notification error:', err.message)
      })
    }
    res.json(withFreshness(product.toObject ? product.toObject() : product))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/products/:id — Vendor deletes product
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, vendor: req.user._id })
    if (!product) {
      return res.status(404).json({ message: 'Product not found or does not belong to your account' })
    }
    res.json({ message: 'Product deleted successfully', id: req.params.id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
