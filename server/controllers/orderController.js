import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import mongoose from 'mongoose'
import { randomInt, randomUUID } from 'node:crypto'
import { createNotification } from '../utils/notifications.js'
import { sendEmail, isEmailConfigured } from '../utils/email.js'
import { sendUserMessage } from '../utils/messageDispatch.js'
import {
  calculateDeliveryQuote,
  getProductVendorDeliveryDistances,
  VENDOR_DELIVERY_RADIUS_KM,
} from '../utils/deliveryDispatch.js'
import {
  displayOrderStatus,
  normalizeOrderStatus,
  serializeOrderForClient,
} from '../utils/orderStatus.js'

function generateOrderId() {
  const year = new Date().getFullYear()
  return `CF-${year}-${randomUUID().slice(0, 8).toUpperCase()}`
}

// POST /api/orders — Customer checkout (Calculates prices and verifies stock on backend!)
export async function createOrder(req, res) {
  let session
  try {
    const { items, address, deliveryLocation, paymentMethod = 'cod' } = req.body
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'Cart is empty' })
    }
    if (paymentMethod !== 'cod') {
      return res.status(503).json({ message: 'Online payment is not available yet.' })
    }

    const deliveryAddress = typeof address === 'string' ? address.trim() : ''
    if (!deliveryAddress || deliveryAddress.length > 500) {
      return res.status(400).json({ message: 'A delivery address of up to 500 characters is required.' })
    }
    const hasDeliveryLocation = deliveryLocation !== undefined && deliveryLocation !== null
    if (
      hasDeliveryLocation &&
      (
        !Number.isFinite(deliveryLocation.latitude) ||
        deliveryLocation.latitude < -90 ||
        deliveryLocation.latitude > 90 ||
        !Number.isFinite(deliveryLocation.longitude) ||
        deliveryLocation.longitude < -180 ||
        deliveryLocation.longitude > 180
      )
    ) {
      return res.status(400).json({ message: 'The delivery GPS coordinates are invalid.' })
    }
    const productIds = items.map((item) => item?.productId || item?._id || item?.id)
    for (const [index, item] of items.entries()) {
      if (!item || !mongoose.isValidObjectId(productIds[index])) {
        return res.status(400).json({ message: 'Invalid product ID.' })
      }
      const quantity = Number(item.qty)
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Item quantity must be a positive whole number.' })
      }
    }
    const vendorDistances = await getProductVendorDeliveryDistances(
      productIds,
      hasDeliveryLocation ? deliveryLocation : deliveryAddress,
    )
    const outOfRangeVendors = vendorDistances.filter((vendor) => !vendor.deliverable)
    if (outOfRangeVendors.length) {
      return res.status(422).json({
        message: `This order cannot be delivered within the ${VENDOR_DELIVERY_RADIUS_KM} km limit: ${outOfRangeVendors.map((vendor) => `${vendor.name}: ${vendor.reason}`).join(' ')}`,
      })
    }
    const deliveryQuote = hasDeliveryLocation
      ? await calculateDeliveryQuote(
          productIds,
          deliveryLocation,
        )
      : null

    const affectedVendors = new Set()
    let order
    session = await mongoose.startSession()

    await session.withTransaction(async () => {
      const quantities = new Map()
      for (const item of items) {
        const productId = item.productId || item._id || item.id
        const qty = Number(item.qty)
        if (!mongoose.isValidObjectId(productId)) {
          const error = new Error('Invalid product ID.')
          error.status = 400
          throw error
        }
        if (!Number.isInteger(qty) || qty <= 0) {
          const error = new Error('Item quantity must be a positive whole number.')
          error.status = 400
          throw error
        }
        quantities.set(productId, (quantities.get(productId) || 0) + qty)
      }

      const products = await Product.find({
        _id: { $in: [...quantities.keys()] },
        status: 'Active',
      }).session(session)
      if (products.length !== quantities.size) {
        const error = new Error('One or more products are unavailable.')
        error.status = 404
        throw error
      }

      let subtotal = 0
      const orderItems = []
      for (const product of products) {
        const qty = quantities.get(product._id.toString())

      if (product.stock < qty) {
          const error = new Error(`${product.name} only has ${product.stock} units available in stock.`)
          error.status = 409
          throw error
      }

        const remainingStock = product.stock - qty
        const update = await Product.updateOne(
          { _id: product._id, status: 'Active', stock: { $gte: qty } },
          {
            $inc: { stock: -qty },
            $set: {
              stockStatus: remainingStock <= 0 ? 'Out of Stock' : remainingStock < 15 ? 'Low Stock' : 'In Stock',
            },
          },
          { session }
        )
        if (update.modifiedCount !== 1) {
          const error = new Error(`${product.name} stock changed during checkout. Please retry.`)
          error.status = 409
          throw error
        }

        subtotal += product.discountedPrice * qty
        orderItems.push({
          product: product._id,
          name: product.name,
          qty,
          price: product.discountedPrice,
          vendor: product.vendor,
          vendorName: product.vendorName,
          image: product.image,
        })

        if (product.vendor) affectedVendors.add(product.vendor.toString())
      }

      const deliveryFee = deliveryQuote?.deliveryFee ?? 40
      const total = subtotal + deliveryFee
      const [createdOrder] = await Order.create([{
        orderId: generateOrderId(),
        user: req.user._id,
        items: orderItems,
        total,
        address: deliveryAddress,
        deliveryLocation: hasDeliveryLocation ? deliveryLocation : undefined,
        deliveryDistanceKm: deliveryQuote?.distanceKm ?? 0,
        deliveryFee,
        deliveryVerificationCode: String(randomInt(100000, 1000000)),
        paymentMethod: 'cod',
        paymentStatus: 'Pending',
        status: 'PENDING',
      }], { session })
      order = createdOrder
    })

    await session.endSession()
    session = null
    const total = order.total
    let dispatch = { assigned: false, reason: 'The order will be dispatched when it is packed.' }

    const notificationJobs = [
      createNotification({
        userId: req.user._id,
        type: 'order',
        title: 'Order Confirmed',
        message: `Your order ${order.orderId} for ₹${total} has been placed and is now pending dispatch.`,
        link: 'history',
      }),
      ...[...affectedVendors].map((vendorId) => createNotification({
        userId: vendorId,
        type: 'order',
        title: 'New Order Received',
        message: `New items are included in order ${order.orderId}.`,
        link: 'orders',
      })),
    ]
    await Promise.allSettled(notificationJobs)

    let emailResult = {
      sent: false,
      configured: isEmailConfigured(),
      message: 'Email service is not configured.',
    }
    if (isEmailConfigured() && req.user.email) {
      emailResult = await sendEmail({
        to: req.user.email,
        subject: `Cyber Fresh — Order Confirmed: ${order.orderId}`,
        html: `
          <h2>Thank you for your order!</h2>
          <p>Order ID: <strong>${order.orderId}</strong></p>
          <p>Total Amount: <strong>₹${order.total}</strong></p>
          <p>Status: ${order.status}</p>
          <p>Delivery Address: ${order.address}</p>
          <p>Delivery verification code: <strong>${order.deliveryVerificationCode}</strong>. Share this code with the delivery partner only when your order arrives.</p>
        `,
      })
    }

    const vendorUsers = await User.find({ _id: { $in: [...affectedVendors] } })
    await Promise.allSettled(vendorUsers.map((vendor) => sendUserMessage(
      vendor,
      `CyberFresh: New order ${order.orderId} includes your products. Please review it in your vendor portal.`,
    )))

    res.status(201).json({
      ...serializeOrderForClient(order),
      deliveryVerificationCode: order.deliveryVerificationCode,
      dispatch,
      communications: { email: emailResult },
    })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(err.status || 500).json({ message: err.message || 'Failed to create order' })
  } finally {
    if (session) await session.endSession()
  }
}

// POST /api/orders/delivery-quote — Customer delivery charge estimate
export async function createDeliveryQuote(req, res) {
  try {
    const { productIds, deliveryLocation } = req.body
    const quote = await calculateDeliveryQuote(productIds, deliveryLocation)
    res.json(quote)
  } catch (error) {
    res.status(error.status || 503).json({ message: error.message || 'Unable to calculate delivery distance.' })
  }
}

// GET /api/orders/mine — Customer's order history
export async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user._id })
      .select('+deliveryVerificationCode')
      .populate('deliveryPartner.user', 'deliveryPartnerProfile.location deliveryPartnerProfile.locationUpdatedAt')
      .sort({ createdAt: -1 })
    await Promise.all(orders.map(async (order) => {
      if (
        !order.deliveryVerificationCode &&
        !['DELIVERED', 'CANCELLED'].includes(normalizeOrderStatus(order.status))
      ) {
        order.deliveryVerificationCode = String(randomInt(100000, 1000000))
        await order.save()
      }
    }))
    const now = Date.now()
    res.json(orders.map((order) => {
      const value = serializeOrderForClient(order)
      value.deliveryVerificationCode = order.deliveryVerificationCode || ''
      const partnerUser = order.deliveryPartner?.user
      const location = partnerUser?.deliveryPartnerProfile?.location
      const locationUpdatedAt = partnerUser?.deliveryPartnerProfile?.locationUpdatedAt
      const locationIsCurrent =
        normalizeOrderStatus(order.status) === 'OUT_FOR_DELIVERY' &&
        location &&
        locationUpdatedAt &&
        now - new Date(locationUpdatedAt).getTime() <= 2 * 60 * 1000
      if (value.deliveryPartner) {
        value.deliveryPartner.user = undefined
      }
      if (locationIsCurrent && value.deliveryPartner) {
        value.deliveryPartner.liveLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          updatedAt: locationUpdatedAt,
        }
      }
      return value
    }))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/orders/vendor — Vendor's relevant orders
export async function getVendorOrders(req, res) {
  try {
    const orders = await Order.find({ 'items.vendor': req.user._id })
      .populate('user', 'name email phone address')
      .sort({ createdAt: -1 })
    res.json(orders.map((order) => serializeOrderForClient(order)))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/orders/:id
export async function getOrder(req, res) {
  try {
    const query = { _id: req.params.id }
    if (req.user.role === 'customer') {
      query.user = req.user._id
    }
    const orderQuery = Order.findOne(query)
    if (req.user.role === 'customer') orderQuery.select('+deliveryVerificationCode')
    const order = await orderQuery.populate('user', 'name email phone')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (req.user.role === 'vendor' && !order.items.some((item) => item.vendor?.toString() === req.user._id.toString())) {
      return res.status(404).json({ message: 'Order not found' })
    }
    if (!['customer', 'vendor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    const value = serializeOrderForClient(order)
    if (req.user.role === 'customer') {
      value.deliveryVerificationCode = order.deliveryVerificationCode || ''
    }
    res.json(value)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PATCH /api/orders/:id/status — Vendor or Admin updates status
export async function updateOrderStatus(req, res) {
  try {
    const { status, deliveryPartner, dispatch: requestDispatch } = req.body
    const normalizedStatus = typeof status === 'string' ? normalizeOrderStatus(status) : status
    const transitions = {
      PENDING: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['PICKED_UP', 'CANCELLED'],
      PICKED_UP: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: [],
    }
    if (normalizedStatus !== undefined && !Object.hasOwn(transitions, normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }
    if (requestDispatch !== undefined && typeof requestDispatch !== 'boolean') {
      return res.status(400).json({ message: 'Dispatch must be true or false.' })
    }
    if (deliveryPartner !== undefined) {
      return res.status(403).json({ message: 'Delivery partners select available packed orders from their portal.' })
    }
    if (requestDispatch === true) {
      return res.status(403).json({ message: 'Delivery partners select available packed orders from their portal.' })
    }
    if (status === undefined) {
      return res.status(400).json({ message: 'Provide an order status.' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (normalizedStatus === 'DELIVERED' && order.deliveryPartner?.user) {
      return res.status(403).json({ message: 'The assigned delivery partner must confirm the delivery with the customer’s handoff code.' })
    }

    // If vendor, ensure order contains this vendor's items
    if (req.user.role === 'vendor') {
      const isVendorItem = order.items.some(i => i.vendor?.toString() === req.user._id.toString())
      if (!isVendorItem) {
        return res.status(403).json({ message: 'Not authorized to update this order' })
      }
      const currentStatus = normalizeOrderStatus(order.status)
      if (normalizedStatus === undefined || !transitions[currentStatus]?.includes(normalizedStatus)) {
        return res.status(409).json({ message: `Order cannot transition from ${displayOrderStatus(order.status)} to ${displayOrderStatus(normalizedStatus)}.` })
      }
    }

    const statusChanged = normalizedStatus !== undefined && order.status !== normalizedStatus
    if (statusChanged) order.status = normalizedStatus
    if (normalizedStatus === 'DELIVERED' && order.deliveryPartner?.user) {
      order.deliveryPartner.earningsStatus = 'Payable'
    }
    await order.save()
    if (
      statusChanged &&
      ['DELIVERED', 'CANCELLED'].includes(normalizedStatus) &&
      order.deliveryPartner?.user
    ) {
      await User.updateOne(
        { _id: order.deliveryPartner.user, 'deliveryPartnerProfile.activeOrder': order._id },
        { $set: { 'deliveryPartnerProfile.activeOrder': null } },
      )
    }
    if (statusChanged) {
      const displayStatus = displayOrderStatus(order.status)
      await createNotification({
        userId: order.user,
        type: 'order',
        title: `Order Update: ${displayStatus} 🚚`,
        message: `Your order ${order.orderId} status is now "${displayStatus}".`,
        link: 'tracking',
      })
      const vendorIds = [...new Set(order.items.map((item) => item.vendor?.toString()).filter(Boolean))]
      const [customer, vendors, deliveryPartner] = await Promise.all([
        User.findById(order.user),
        User.find({ _id: { $in: vendorIds } }),
        order.deliveryPartner?.user ? User.findById(order.deliveryPartner.user) : null,
      ])
      const deliveries = []
      if (customer) {
        const feedback = normalizedStatus === 'DELIVERED'
          ? ' Please reply with your feedback.'
          : ''
        deliveries.push(sendUserMessage(
          customer,
          `CyberFresh: Order ${order.orderId} is ${displayStatus}.${feedback}`,
        ))
      }
      if (normalizedStatus === 'DELIVERED') {
        deliveries.push(...vendors.map((vendor) => sendUserMessage(
          vendor,
          `CyberFresh: Order ${order.orderId} has been delivered to the customer.`,
        )))
        if (deliveryPartner) {
          deliveries.push(sendUserMessage(
            deliveryPartner,
            `CyberFresh: Thank you for delivering order ${order.orderId}. Your delivery earnings are now payable.`,
          ))
        }
      } else if (deliveryPartner) {
        deliveries.push(sendUserMessage(
          deliveryPartner,
          `CyberFresh: Order ${order.orderId} status is now ${displayStatus}.`,
        ))
      }
      const results = await Promise.allSettled(deliveries)
      for (const result of results) {
        if (result.status === 'rejected') {
          console.error('Order message dispatch failed:', result.reason)
        }
      }
    }

    res.json(serializeOrderForClient(order))
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
