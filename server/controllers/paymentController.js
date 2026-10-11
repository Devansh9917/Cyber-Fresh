import crypto from 'crypto'
import Razorpay from 'razorpay'
import Payment from '../models/Payment.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import mongoose from 'mongoose'
import { createNotification } from '../utils/notifications.js'
import { sendEmail, isEmailConfigured } from '../utils/email.js'
import {
  calculateDeliveryQuote,
  getProductVendorDeliveryDistances,
  VENDOR_DELIVERY_RADIUS_KM,
} from '../utils/deliveryDispatch.js'
import { sendUserMessage } from '../utils/messageDispatch.js'

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  const isPlaceholder = (value) => !value || /placeholder|your_|replace_me/i.test(value)
  if (isPlaceholder(keyId) || isPlaceholder(keySecret)) return null
  return { keyId, keySecret }
}

function getRazorpayInstance() {
  const credentials = getRazorpayCredentials()
  return credentials
    ? new Razorpay({ key_id: credentials.keyId, key_secret: credentials.keySecret })
    : null
}

function generateOrderId() {
  const year = new Date().getFullYear()
  return `CF-${year}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('Cart is empty.')
    error.status = 400
    throw error
  }
  const quantities = new Map()
  for (const item of items) {
    const productId = item?.productId || item?._id || item?.id
    const qty = Number(item?.qty)
    if (!mongoose.isValidObjectId(productId)) {
      const error = new Error('Invalid product ID.')
      error.status = 400
      throw error
    }
    if (!Number.isInteger(qty) || qty <= 0 || qty > 100) {
      const error = new Error('Item quantity must be a whole number between 1 and 100.')
      error.status = 400
      throw error
    }
    quantities.set(productId.toString(), (quantities.get(productId.toString()) || 0) + qty)
  }
  const normalized = [...quantities]
    .map(([productId, qty]) => ({ productId, qty }))
    .sort((left, right) => left.productId.localeCompare(right.productId))
  if (normalized.some((item) => item.qty > 100)) {
    const error = new Error('A product quantity cannot exceed 100 per order.')
    error.status = 400
    throw error
  }
  return normalized
}

function validateDeliveryInput(address, deliveryLocation) {
  const normalizedAddress = typeof address === 'string' ? address.trim() : ''
  if (!normalizedAddress || normalizedAddress.length > 500) {
    const error = new Error('A delivery address of up to 500 characters is required.')
    error.status = 400
    throw error
  }
  const hasLocation = deliveryLocation !== undefined && deliveryLocation !== null
  if (hasLocation && (
    !Number.isFinite(deliveryLocation.latitude) ||
    deliveryLocation.latitude < -90 ||
    deliveryLocation.latitude > 90 ||
    !Number.isFinite(deliveryLocation.longitude) ||
    deliveryLocation.longitude < -180 ||
    deliveryLocation.longitude > 180
  )) {
    const error = new Error('The delivery GPS coordinates are invalid.')
    error.status = 400
    throw error
  }
  return { address: normalizedAddress, hasLocation }
}

function getCheckoutFingerprint(items, address, deliveryLocation) {
  return crypto.createHash('sha256')
    .update(JSON.stringify({
      items,
      address,
      deliveryLocation: deliveryLocation || null,
    }))
    .digest('hex')
}

async function getCheckoutData(items, address, deliveryLocation) {
  const { address: normalizedAddress, hasLocation } = validateDeliveryInput(address, deliveryLocation)
  const vendorDistances = await getProductVendorDeliveryDistances(
    items.map((item) => item.productId),
    hasLocation ? deliveryLocation : normalizedAddress,
  )
  const outsideRadius = vendorDistances.filter((vendor) => !vendor.deliverable)
  if (outsideRadius.length) {
    const error = new Error(
      `This order cannot be delivered within the ${VENDOR_DELIVERY_RADIUS_KM} km limit: ${outsideRadius.map((vendor) => `${vendor.name}: ${vendor.reason}`).join(' ')}`,
    )
    error.status = 422
    throw error
  }
  const products = await Product.find({
    _id: { $in: items.map((item) => item.productId) },
    status: 'Active',
  })
  if (products.length !== items.length) {
    const error = new Error('One or more products are unavailable.')
    error.status = 404
    throw error
  }
  const productById = new Map(products.map((product) => [product._id.toString(), product]))
  let subtotal = 0
  for (const item of items) {
    const product = productById.get(item.productId)
    if (!product || product.stock < item.qty) {
      const error = new Error(`${product?.name || 'A product'} is out of stock or has insufficient quantity.`)
      error.status = 409
      throw error
    }
    subtotal += product.discountedPrice * item.qty
  }
  const deliveryQuote = hasLocation
    ? await calculateDeliveryQuote(items.map((item) => item.productId), deliveryLocation)
    : null
  const deliveryFee = deliveryQuote?.deliveryFee ?? 40
  const amountInPaise = Math.round((subtotal + deliveryFee) * 100)
  return {
    address: normalizedAddress,
    hasLocation,
    products: productById,
    deliveryQuote,
    deliveryFee,
    amountInPaise,
    total: amountInPaise / 100,
  }
}

// GET /api/payment/config
export async function getPaymentConfig(req, res) {
  const credentials = getRazorpayCredentials()
  res.json({
    keyId: credentials?.keyId || '',
    isConfigured: Boolean(credentials),
  })
}

// POST /api/payment/create-order — Calculates totals on backend and creates Razorpay order
export async function createPaymentOrder(req, res) {
  try {
    const rzp = getRazorpayInstance()
    if (!rzp) {
      return res.status(503).json({ message: 'Payment service is not configured.' })
    }
    const items = normalizeItems(req.body.items)
    const { address, deliveryLocation } = req.body
    const checkout = await getCheckoutData(items, address, deliveryLocation)
    const fingerprint = getCheckoutFingerprint(items, checkout.address, deliveryLocation)

    const rzpOrder = await rzp.orders.create({
      amount: checkout.amountInPaise,
      currency: 'INR',
      receipt: `cf_${crypto.randomUUID().replaceAll('-', '').slice(0, 24)}`,
      notes: {
        customerId: req.user._id.toString(),
        checkoutFingerprint: fingerprint,
      },
    })

    res.json({
      orderId: rzpOrder.id,
      amount: checkout.total,
      amountInPaise: checkout.amountInPaise,
      deliveryFee: checkout.deliveryFee,
      currency: 'INR',
      keyId: getRazorpayCredentials().keyId,
      isTestMode: getRazorpayCredentials().keyId.startsWith('rzp_test_'),
    })
  } catch (err) {
    console.error('Payment order creation error:', err)
    res.status(err.status || 500).json({ message: err.message || 'Failed to create payment order' })
  }
}

// POST /api/payment/verify — Verifies signature, updates stock, creates Order & Payment in MongoDB
export async function verifyPayment(req, res) {
  let session
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      address,
      deliveryLocation,
    } = req.body
    const paymentMethod = 'razorpay'

    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      !razorpay_order_id ||
      !razorpay_payment_id
    ) {
      return res.status(400).json({ message: 'Missing payment verification details' })
    }

    const credentials = getRazorpayCredentials()
    const rzp = getRazorpayInstance()
    if (!rzp || !credentials) {
      return res.status(503).json({ message: 'Payment service is not configured.' })
    }

    const generatedSignature = crypto
      .createHmac('sha256', credentials.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    const suppliedSignature = typeof razorpay_signature === 'string' ? razorpay_signature : ''
    const expected = Buffer.from(generatedSignature, 'hex')
    const supplied = Buffer.from(suppliedSignature, 'hex')
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
      return res.status(400).json({ message: 'Payment verification failed: Invalid cryptographic signature.' })
    }

    const rzpOrder = await rzp.orders.fetch(razorpay_order_id)
    const verifiedPayment = await rzp.payments.fetch(razorpay_payment_id)
    if (
      verifiedPayment.order_id !== razorpay_order_id ||
      verifiedPayment.status !== 'captured' ||
      verifiedPayment.currency !== 'INR' ||
      rzpOrder.currency !== 'INR' ||
      verifiedPayment.amount !== rzpOrder.amount ||
      rzpOrder.notes?.customerId !== req.user._id.toString()
    ) {
      return res.status(400).json({ message: 'Payment has not been captured for this order.' })
    }

    const existingPayment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      paymentStatus: 'Paid',
      user: req.user._id,
    })
    if (existingPayment) {
      if (existingPayment.razorpayPaymentId !== razorpay_payment_id) {
        return res.status(409).json({ message: 'This Razorpay order has already been paid with a different transaction.' })
      }
      const existingOrder = await Order.findById(existingPayment.order)
      if (existingOrder) {
        return res.json({
          success: true,
          message: 'Payment was already verified.',
          order: existingOrder,
          payment: existingPayment,
        })
      }
    }

    const normalizedItems = normalizeItems(items)
    const { address: normalizedAddress, hasLocation } = validateDeliveryInput(address, deliveryLocation)
    const fingerprint = getCheckoutFingerprint(normalizedItems, normalizedAddress, deliveryLocation)
    if (rzpOrder.notes?.checkoutFingerprint !== fingerprint) {
      return res.status(400).json({ message: 'The cart or delivery details changed after payment was initiated. Contact support before retrying.' })
    }
    const checkout = await getCheckoutData(normalizedItems, normalizedAddress, deliveryLocation)
    if (checkout.amountInPaise !== rzpOrder.amount) {
      return res.status(400).json({ message: 'The paid amount does not match the current server-calculated order total.' })
    }

    const orderItems = []
    const affectedVendors = new Set()
    const total = checkout.total
    const internalOrderId = generateOrderId()
    let order
    let payment
    let wasAlreadyVerified = false
    session = await mongoose.startSession()
    await session.withTransaction(async () => {
      orderItems.length = 0
      affectedVendors.clear()
      wasAlreadyVerified = false
      order = null
      payment = null
      const currentPayment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
        paymentStatus: 'Paid',
        user: req.user._id,
      }).session(session)
      if (currentPayment) {
        const currentOrder = await Order.findById(currentPayment.order).session(session)
        if (currentOrder) {
          if (currentPayment.razorpayPaymentId !== razorpay_payment_id) {
            const error = new Error('This Razorpay order has already been paid with a different transaction.')
            error.status = 409
            throw error
          }
          order = currentOrder
          payment = currentPayment
          wasAlreadyVerified = true
          return
        }
      }
      for (const item of normalizedItems) {
        const product = checkout.products.get(item.productId)
        const nextStock = product.stock - item.qty
        const update = await Product.updateOne(
          { _id: product._id, status: 'Active', stock: { $gte: item.qty } },
          {
            $inc: { stock: -item.qty },
            $set: { stockStatus: nextStock <= 0 ? 'Out of Stock' : nextStock < 15 ? 'Low Stock' : 'In Stock' },
          },
          { session },
        )
        if (update.modifiedCount !== 1) {
          const error = new Error(`${product.name} stock changed during payment. Contact support if you were charged.`)
          error.status = 409
          throw error
        }
        orderItems.push({
          product: product._id,
          name: product.name,
          qty: item.qty,
          price: product.discountedPrice,
          vendor: product.vendor,
          vendorName: product.vendorName,
          image: product.image,
        })
        if (product.vendor) affectedVendors.add(product.vendor.toString())
      }
      const [createdOrder] = await Order.create([{
        orderId: internalOrderId,
        user: req.user._id,
        items: orderItems,
        total,
        address: normalizedAddress,
        deliveryLocation: hasLocation ? deliveryLocation : undefined,
        deliveryDistanceKm: checkout.deliveryQuote?.distanceKm ?? 0,
        deliveryFee: checkout.deliveryFee,
        paymentMethod,
        paymentStatus: 'Paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: suppliedSignature,
        status: 'PENDING',
      }], { session })
      order = createdOrder
      const [createdPayment] = await Payment.create([{
        paymentId: razorpay_payment_id,
        order: order._id,
        orderId: internalOrderId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: suppliedSignature,
        amount: total,
        currency: 'INR',
        paymentStatus: 'Paid',
        user: req.user._id,
        paymentMethod,
      }], { session })
      payment = createdPayment
    })
    await session.endSession()
    session = null
    if (wasAlreadyVerified) {
      return res.json({
        success: true,
        message: 'Payment was already verified.',
        order,
        payment,
      })
    }

    const notifications = [
      createNotification({
        userId: req.user._id,
        type: 'payment',
        title: 'Payment Successful',
        message: `Your payment of ₹${total} for order ${order.orderId} was verified and received.`,
        link: 'history',
      }),
      ...[...affectedVendors].map((vendorId) => createNotification({
        userId: vendorId,
        type: 'order',
        title: 'Paid Order Received',
        message: `Order ${order.orderId} has been paid and confirmed. Prepare for fulfillment.`,
        link: 'orders',
      })),
    ]
    const notificationResults = await Promise.allSettled(notifications)
    notificationResults.filter((result) => result.status === 'rejected').forEach((result) => {
      console.error('Payment notification error:', result.reason)
    })
    try {
      const vendorUsers = affectedVendors.size
        ? await User.find({ _id: { $in: [...affectedVendors] } })
        : []
      const vendorMessages = await Promise.allSettled(vendorUsers.map((vendor) => sendUserMessage(
        vendor,
        `CyberFresh: A paid order ${order.orderId} includes your products. Please prepare it for fulfillment.`,
        { purpose: 'notification' },
      )))
      vendorMessages.filter((result) => result.status === 'rejected').forEach((result) => {
        console.error('Vendor payment message error:', result.reason)
      })
    } catch (vendorMessageError) {
      console.error('Vendor payment message dispatch error:', vendorMessageError)
    }

    if (isEmailConfigured() && req.user.email) {
      sendEmail({
        to: req.user.email,
        subject: `Payment Receipt: ${order.orderId}`,
        html: `
          <h2>Payment Receipt — Cyber Fresh</h2>
          <p>Order ID: <strong>${order.orderId}</strong></p>
          <p>Payment ID: <strong>${razorpay_payment_id}</strong></p>
          <p>Amount Paid: <strong>₹${total}</strong></p>
          <p>Status: <strong>Paid</strong></p>
        `,
      }).catch((emailError) => console.error('Payment receipt email error:', emailError))
    }
    let communications = []
    try {
      communications = await sendUserMessage(
        req.user,
        `CyberFresh payment received. Order ${order.orderId}; amount INR ${total}.`,
        { purpose: 'notification' },
      )
    } catch (messageError) {
      console.error('Payment confirmation message error:', messageError)
    }

    res.status(201).json({
      success: true,
      message: 'Payment verified and order created successfully.',
      order,
      payment,
      communications,
    })
  } catch (err) {
    console.error('Payment verification error:', err)
    res.status(err.status || 500).json({ message: err.message || 'Payment could not be completed.' })
  } finally {
    if (session) await session.endSession()
  }
}

// GET /api/payment/history — Requirement 19
export async function getPaymentHistory(req, res) {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user._id }
    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .sort({ date: -1 })
    res.json(payments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
