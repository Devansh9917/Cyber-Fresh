import express from 'express'
import mongoose from 'mongoose'
import { timingSafeEqual } from 'node:crypto'
import Order from '../models/Order.js'
import Donation from '../models/Donation.js'
import User from '../models/User.js'
import { protect, restrictTo } from '../middleware/auth.js'
import { createNotification } from '../utils/notifications.js'
import { sendUserMessage } from '../utils/messageDispatch.js'
import { normalizeDeliveryAction, normalizeOrderStatus, serializeOrderForClient } from '../utils/orderStatus.js'

const router = express.Router()
router.use(protect, restrictTo('delivery_partner'))

function serializeDonationForPartner(donation) {
  const value = donation.toObject()
  delete value.deliveryVerificationCode
  return value
}

function hasValidLocation(location) {
  return location &&
    Number.isFinite(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    Number.isFinite(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180
}

router.get('/jobs', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    const jobs = await Order.find({ 'deliveryPartner.user': req.user._id })
      .populate('user', 'name phone')
      .populate('items.vendor', 'name businessName address city state pincode phone')
      .sort({ updatedAt: -1 })
      .limit(50)
    res.json(jobs.map((job) => serializeOrderForClient(job)))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/available-jobs', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    const jobs = await Order.find({
      status: 'ASSIGNED',
      'deliveryPartner.user': null,
    })
      .populate('user', 'name')
      .populate('items.vendor', 'name businessName address city state pincode phone')
      .sort({ createdAt: 1 })
      .limit(50)
    res.json(jobs.map((job) => serializeOrderForClient(job)))
  } catch (error) {
    console.error('Available delivery lookup failed:', error)
    res.status(500).json({ message: error.message || 'Could not load available deliveries.' })
  }
})

router.get('/earnings', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    const match = {
      'deliveryPartner.user': req.user._id,
      'deliveryPartner.earningsStatus': { $in: ['Payable', 'Paid'] },
    }
    const [totals, history] = await Promise.all([
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$deliveryPartner.earningsStatus',
            amount: { $sum: '$deliveryPartner.earnings' },
            count: { $sum: 1 },
          },
        },
      ]),
      Order.find(match)
        .select('orderId updatedAt deliveryPartner')
        .sort({ 'deliveryPartner.paidAt': -1, updatedAt: -1 })
        .limit(100),
    ])
    const amounts = Object.fromEntries(totals.map((item) => [item._id, item.amount]))
    res.json({
      payable: amounts.Payable || 0,
      paid: amounts.Paid || 0,
      history: history.map((order) => ({
        _id: order._id,
        orderId: order.orderId,
        updatedAt: order.updatedAt,
        earnings: order.deliveryPartner.earnings,
        distanceKm: order.deliveryPartner.distanceKm,
        earningsStatus: order.deliveryPartner.earningsStatus,
        paidAt: order.deliveryPartner.paidAt,
        payoutReference: order.deliveryPartner.payoutReference,
      })),
    })
  } catch (error) {
    console.error('Delivery partner earnings lookup failed:', error)
    res.status(500).json({ message: error.message || 'Could not load delivery earnings.' })
  }
})

router.patch('/availability', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    const { online, location } = req.body
    if (typeof online !== 'boolean') {
      return res.status(400).json({ message: 'Availability must be true or false.' })
    }
    if (online && !hasValidLocation(location)) {
      return res.status(400).json({ message: 'A valid GPS location is required to go online.' })
    }
    if (!online && (req.user.deliveryPartnerProfile?.activeOrder || req.user.deliveryPartnerProfile?.activeDonation)) {
      return res.status(409).json({ message: 'Complete or reject your active delivery before going offline.' })
    }

    const update = online
      ? {
          $set: {
            'deliveryPartnerProfile.online': true,
            'deliveryPartnerProfile.availabilityStatus': 'AVAILABLE',
            'deliveryPartnerProfile.location': location,
            'deliveryPartnerProfile.locationUpdatedAt': new Date(),
          },
        }
      : { $set: { 'deliveryPartnerProfile.online': false, 'deliveryPartnerProfile.availabilityStatus': 'UNAVAILABLE' } }
    const partner = await User.findByIdAndUpdate(req.user._id, update, { new: true })
      .select('deliveryPartnerProfile')

    res.json({ online: partner.deliveryPartnerProfile.online })
  } catch (error) {
    console.error('Delivery partner availability error:', error)
    res.status(500).json({ message: error.message || 'Could not update availability.' })
  }
})

router.patch('/location', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    if (!req.user.deliveryPartnerProfile?.online) {
      return res.status(409).json({ message: 'Go online before sharing your location.' })
    }
    if (!hasValidLocation(req.body.location)) {
      return res.status(400).json({ message: 'A valid GPS location is required.' })
    }
    await User.updateOne(
      { _id: req.user._id, status: 'Active', 'deliveryPartnerProfile.online': true, 'deliveryPartnerProfile.approvalStatus': 'APPROVED' },
      {
        $set: {
          'deliveryPartnerProfile.location': req.body.location,
          'deliveryPartnerProfile.locationUpdatedAt': new Date(),
        },
      },
    )
    res.json({ updated: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/jobs/:orderId/claim', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({ message: 'The order ID is invalid.' })
    }

    const availableOrder = await Order.findOne({
      _id: req.params.orderId,
      status: 'ASSIGNED',
      'deliveryPartner.user': null,
    }).select('deliveryDistanceKm deliveryFee')
    if (!availableOrder) {
      return res.status(409).json({ message: 'This order was already selected by another delivery partner.' })
    }

    const reservedPartner = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        role: 'delivery_partner',
        status: 'Active',
        'deliveryPartnerProfile.approvalStatus': 'APPROVED',
        'deliveryPartnerProfile.online': true,
        'deliveryPartnerProfile.activeOrder': null,
        'deliveryPartnerProfile.activeDonation': null,
      },
      {
        $set: {
          'deliveryPartnerProfile.activeOrder': req.params.orderId,
          'deliveryPartnerProfile.availabilityStatus': 'UNAVAILABLE',
        },
      },
      { new: true },
    ).select('name phone')
    if (!reservedPartner) {
      return res.status(409).json({ message: 'Go online and finish your active delivery before selecting another order.' })
    }

    let order
    try {
      order = await Order.findOneAndUpdate(
        {
          _id: req.params.orderId,
          status: 'ASSIGNED',
          'deliveryPartner.user': null,
        },
        {
          $set: {
            deliveryPartner: {
              user: reservedPartner._id,
              name: reservedPartner.name,
              phone: reservedPartner.phone,
              status: 'ASSIGNED',
              distanceKm: availableOrder.deliveryDistanceKm || 0,
              earnings: availableOrder.deliveryFee || 40,
              earningsStatus: 'NotEarned',
              assignedAt: new Date(),
            },
          },
        },
        { new: true, runValidators: true },
      )
    } catch (error) {
      await User.updateOne(
        { _id: reservedPartner._id, 'deliveryPartnerProfile.activeOrder': req.params.orderId },
        {
          $set: {
            'deliveryPartnerProfile.activeOrder': null,
            'deliveryPartnerProfile.availabilityStatus': 'AVAILABLE',
          },
        },
      )
      throw error
    }
    if (!order) {
      await User.updateOne(
        { _id: reservedPartner._id, 'deliveryPartnerProfile.activeOrder': req.params.orderId },
        {
          $set: {
            'deliveryPartnerProfile.activeOrder': null,
            'deliveryPartnerProfile.availabilityStatus': 'AVAILABLE',
          },
        },
      )
      return res.status(409).json({ message: 'This order was already selected by another delivery partner.' })
    }

    const notificationResults = await Promise.allSettled([
      createNotification({
        userId: order.user,
        type: 'order',
        title: 'Delivery partner assigned',
        message: `${reservedPartner.name} has selected order ${order.orderId}.`,
        link: 'tracking',
      }),
      createNotification({
        userId: reservedPartner._id,
        type: 'order',
        title: 'Delivery selected',
        message: `You selected order ${order.orderId}. Estimated earnings: ₹${order.deliveryFee || 40}.`,
        link: 'delivery-jobs',
      }),
    ])
    for (const result of notificationResults) {
      if (result.status === 'rejected') {
        console.error('Delivery selection notification failed:', result.reason)
      }
    }
    await sendUserMessage(
      req.user,
      `CyberFresh: You selected order ${order.orderId}. Estimated delivery earnings: INR ${order.deliveryFee || 40}.`,
    )
    res.json({ order: serializeOrderForClient(order) })
  } catch (error) {
    console.error('Delivery selection failed:', error)
    res.status(500).json({ message: error.message || 'Could not select this delivery.' })
  }
})

router.get('/available-donation-jobs', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    const donations = await Donation.find({
      status: 'Accepted',
      'deliveryPartner.user': null,
      'deliveryPartner.status': { $in: ['PENDING', 'REJECTED'] },
    })
      .populate('vendor', 'name businessName phone address city state pincode')
      .populate('ngo', 'name ngoName phone address city state pincode')
      .sort({ updatedAt: 1 })
      .limit(50)
    res.json(donations)
  } catch (error) {
    console.error('Available NGO donation lookup failed:', error)
    res.status(500).json({ message: error.message || 'Could not load NGO pickups.' })
  }
})

router.get('/donation-jobs', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    const donations = await Donation.find({
      'deliveryPartner.user': req.user._id,
      'deliveryPartner.status': { $nin: ['DELIVERED', 'REJECTED'] },
    })
      .populate('vendor', 'name businessName phone address city state pincode')
      .populate('ngo', 'name ngoName phone address city state pincode')
      .sort({ updatedAt: -1 })
      .limit(50)
    res.json(donations)
  } catch (error) {
    console.error('Delivery partner NGO pickup lookup failed:', error)
    res.status(500).json({ message: error.message || 'Could not load your NGO pickups.' })
  }
})

router.post('/donation-jobs/:donationId/claim', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    if (!mongoose.isValidObjectId(req.params.donationId)) {
      return res.status(400).json({ message: 'The donation ID is invalid.' })
    }
    if (!req.user.deliveryPartnerProfile?.online) {
      return res.status(409).json({ message: 'Go online before selecting an NGO pickup.' })
    }

    const reservedPartner = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        role: 'delivery_partner',
        status: 'Active',
        'deliveryPartnerProfile.approvalStatus': 'APPROVED',
        'deliveryPartnerProfile.online': true,
        'deliveryPartnerProfile.activeOrder': null,
        'deliveryPartnerProfile.activeDonation': null,
      },
      {
        $set: {
          'deliveryPartnerProfile.activeDonation': req.params.donationId,
          'deliveryPartnerProfile.availabilityStatus': 'UNAVAILABLE',
        },
      },
      { new: true },
    ).select('name phone')
    if (!reservedPartner) {
      return res.status(409).json({ message: 'Finish your active delivery before selecting another pickup.' })
    }

    let donation
    try {
      donation = await Donation.findOneAndUpdate(
        {
          _id: req.params.donationId,
          status: 'Accepted',
          'deliveryPartner.user': null,
          'deliveryPartner.status': { $in: ['PENDING', 'REJECTED'] },
        },
        {
          $set: {
            'deliveryPartner.user': reservedPartner._id,
            'deliveryPartner.name': reservedPartner.name,
            'deliveryPartner.phone': reservedPartner.phone,
            'deliveryPartner.status': 'ASSIGNED',
            'deliveryPartner.assignedAt': new Date(),
          },
        },
        { new: true, runValidators: true },
      )
        .populate('vendor', 'name businessName phone address city state pincode')
        .populate('ngo', 'name ngoName phone address city state pincode')
    } catch (error) {
      await User.updateOne(
        { _id: reservedPartner._id, 'deliveryPartnerProfile.activeDonation': req.params.donationId },
        {
          $set: {
            'deliveryPartnerProfile.activeDonation': null,
            'deliveryPartnerProfile.availabilityStatus': 'AVAILABLE',
          },
        },
      )
      throw error
    }

    if (!donation) {
      await User.updateOne(
        { _id: reservedPartner._id, 'deliveryPartnerProfile.activeDonation': req.params.donationId },
        {
          $set: {
            'deliveryPartnerProfile.activeDonation': null,
            'deliveryPartnerProfile.availabilityStatus': 'AVAILABLE',
          },
        },
      )
      return res.status(409).json({ message: 'This NGO pickup was already selected by another delivery partner.' })
    }

    await Promise.allSettled([
      createNotification({
        userId: donation.ngo?._id || donation.ngo,
        type: 'donation',
        title: 'Delivery partner assigned',
        message: `${reservedPartner.name} selected the pickup for ${donation.product}. Keep your verification code private until the donation arrives.`,
        link: 'history',
      }),
      sendUserMessage(
        req.user,
        `CyberFresh: You selected NGO donation pickup ${donation.product}. Deliver it to ${donation.ngo?.ngoName || donation.ngo?.name || donation.ngoName}.`,
      ),
    ])
    res.json(donation)
  } catch (error) {
    console.error('NGO donation pickup selection failed:', error)
    res.status(500).json({ message: error.message || 'Could not select this NGO pickup.' })
  }
})

router.patch('/donation-jobs/:donationId', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    if (!mongoose.isValidObjectId(req.params.donationId)) {
      return res.status(400).json({ message: 'The donation ID is invalid.' })
    }
    const { action } = req.body || {}
    if (!['accept', 'reject', 'picked_up', 'out_for_delivery', 'delivered'].includes(action)) {
      return res.status(400).json({ message: 'Invalid NGO pickup action.' })
    }
    const donation = await Donation.findOne({
      _id: req.params.donationId,
      status: 'Accepted',
      'deliveryPartner.user': req.user._id,
    }).select('+deliveryVerificationCode')
    if (!donation) return res.status(404).json({ message: 'Assigned NGO pickup not found.' })

    if (action === 'accept') {
      if (donation.deliveryPartner.status !== 'ASSIGNED') {
        return res.status(409).json({ message: 'This NGO pickup is no longer available to accept.' })
      }
      donation.deliveryPartner.status = 'ACCEPTED'
    } else if (action === 'reject') {
      if (donation.deliveryPartner.status !== 'ASSIGNED') {
        return res.status(409).json({ message: 'Only a newly assigned NGO pickup can be declined.' })
      }
      donation.deliveryPartner.user = null
      donation.deliveryPartner.name = ''
      donation.deliveryPartner.phone = ''
      donation.deliveryPartner.status = 'PENDING'
      await donation.save()
      await User.updateOne(
        { _id: req.user._id, 'deliveryPartnerProfile.activeDonation': donation._id },
        { $set: { 'deliveryPartnerProfile.activeDonation': null, 'deliveryPartnerProfile.availabilityStatus': 'AVAILABLE' } },
      )
      return res.json(serializeDonationForPartner(donation))
    } else if (action === 'picked_up') {
      if (donation.deliveryPartner.status !== 'ACCEPTED') {
        return res.status(409).json({ message: 'Accept this NGO pickup before collecting it from the vendor.' })
      }
      donation.deliveryPartner.status = 'PICKED_UP'
    } else if (action === 'out_for_delivery') {
      if (donation.deliveryPartner.status !== 'PICKED_UP') {
        return res.status(409).json({ message: 'Collect the donation from the vendor before starting delivery.' })
      }
      donation.deliveryPartner.status = 'OUT_FOR_DELIVERY'
    } else {
      if (donation.deliveryPartner.status !== 'OUT_FOR_DELIVERY') {
        return res.status(409).json({ message: 'Only an active NGO delivery can be marked delivered.' })
      }
      const verificationCode = req.body?.verificationCode
      if (typeof verificationCode !== 'string' || !/^\d{6}$/.test(verificationCode)) {
        return res.status(400).json({ message: 'Enter the NGO’s six-digit donation verification code.' })
      }
      if (donation.deliveryVerificationAttempts >= 5) {
        return res.status(429).json({ message: 'Too many incorrect verification codes. Contact support before trying again.' })
      }
      const expectedCode = donation.deliveryVerificationCode || ''
      const codeMatches = expectedCode.length === verificationCode.length &&
        timingSafeEqual(Buffer.from(expectedCode), Buffer.from(verificationCode))
      if (!codeMatches) {
        donation.deliveryVerificationAttempts += 1
        await donation.save()
        return res.status(400).json({
          message: `The NGO verification code is incorrect. ${5 - donation.deliveryVerificationAttempts} attempts remaining.`,
        })
      }
      donation.deliveryPartner.status = 'DELIVERED'
      donation.status = 'Delivered'
      donation.deliveryVerifiedAt = new Date()
      donation.deliveryVerificationCode = ''
    }

    await donation.save()
    if (action === 'delivered') {
      await User.updateOne(
        { _id: req.user._id, 'deliveryPartnerProfile.activeDonation': donation._id },
        { $set: { 'deliveryPartnerProfile.activeDonation': null, 'deliveryPartnerProfile.online': true, 'deliveryPartnerProfile.availabilityStatus': 'AVAILABLE' } },
      )
      const [vendor, ngo] = await Promise.all([
        User.findById(donation.vendor),
        User.findById(donation.ngo),
      ])
      const results = await Promise.allSettled([
        vendor && sendUserMessage(vendor, `CyberFresh: Your donation of ${donation.product} has been delivered to ${donation.ngoName || 'the NGO'}. Thank you for preventing food waste.`),
        ngo && sendUserMessage(ngo, `CyberFresh: Donation ${donation.product} has been delivered and your verification code was confirmed.`),
      ].filter(Boolean))
      for (const result of results) {
        if (result.status === 'rejected') console.error('NGO donation delivery message failed:', result.reason)
      }
    }
    res.json(serializeDonationForPartner(donation))
  } catch (error) {
    console.error('NGO donation delivery update failed:', error)
    res.status(500).json({ message: error.message || 'Could not update the NGO pickup.' })
  }
})

router.patch('/jobs/:orderId', async (req, res) => {
  try {
    if (req.user.status !== 'Active' || req.user.deliveryPartnerProfile?.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Your delivery partner account is waiting for admin approval.' })
    }
    const originalAction = req.body?.action
    const action = normalizeDeliveryAction(originalAction)
    if (!['accept', 'reject', 'picked_up', 'out_for_delivery', 'delivered'].includes(action)) {
      return res.status(400).json({ message: 'Invalid delivery action.' })
    }
    const order = await Order.findOne({
      _id: req.params.orderId,
      'deliveryPartner.user': req.user._id,
    }).select('+deliveryVerificationCode')
    if (!order) return res.status(404).json({ message: 'Assigned delivery not found.' })

    if (action === 'accept') {
      if (order.status !== 'ASSIGNED' || order.deliveryPartner.status !== 'ASSIGNED') {
        return res.status(409).json({ message: 'This delivery is no longer available to accept.' })
      }
      order.status = 'ACCEPTED'
      order.deliveryPartner.status = 'ACCEPTED'
    } else if (action === 'reject') {
      if (order.status !== 'ASSIGNED' || order.deliveryPartner.status !== 'ASSIGNED') {
        return res.status(409).json({ message: 'Only a newly assigned delivery can be rejected.' })
      }
      const rejectedPartnerId = req.user._id
      await User.updateOne(
        { _id: rejectedPartnerId, 'deliveryPartnerProfile.activeOrder': order._id },
        { $set: { 'deliveryPartnerProfile.activeOrder': null, 'deliveryPartnerProfile.availabilityStatus': 'AVAILABLE' } },
      )
      order.deliveryPartner.user = null
      order.deliveryPartner.name = ''
      order.deliveryPartner.phone = ''
      order.deliveryPartner.status = 'REJECTED'
      order.status = 'ASSIGNED'
      await order.save()
      return res.json({ order: serializeOrderForClient(await Order.findById(order._id)) })
    } else if (action === 'picked_up') {
      if (order.status !== 'ACCEPTED' || order.deliveryPartner.status !== 'ACCEPTED') {
        return res.status(409).json({ message: 'Accept this delivery before marking it picked up.' })
      }
      order.status = 'PICKED_UP'
      order.deliveryPartner.status = 'PICKED_UP'
    } else if (action === 'out_for_delivery') {
      if (order.status !== 'PICKED_UP' || order.deliveryPartner.status !== 'PICKED_UP') {
        return res.status(409).json({ message: 'The order must be picked up before it leaves the pickup point.' })
      }
      order.status = 'OUT_FOR_DELIVERY'
      order.deliveryPartner.status = 'OUT_FOR_DELIVERY'
    } else {
      if (order.status !== 'OUT_FOR_DELIVERY' || order.deliveryPartner.status !== 'OUT_FOR_DELIVERY') {
        return res.status(409).json({ message: 'Only an active delivery can be marked delivered.' })
      }
      const verificationCode = req.body?.verificationCode
      if (typeof verificationCode !== 'string' || !/^\d{6}$/.test(verificationCode)) {
        return res.status(400).json({ message: 'Enter the customer’s six-digit delivery verification code.' })
      }
      if (order.deliveryVerificationAttempts >= 5) {
        return res.status(429).json({ message: 'Too many incorrect delivery codes. Contact support before trying again.' })
      }
      const expectedCode = order.deliveryVerificationCode || ''
      const codeMatches = expectedCode.length === verificationCode.length &&
        timingSafeEqual(Buffer.from(expectedCode), Buffer.from(verificationCode))
      if (!codeMatches) {
        order.deliveryVerificationAttempts += 1
        await order.save()
        return res.status(400).json({
          message: `The delivery code is incorrect. ${5 - order.deliveryVerificationAttempts} attempts remaining.`,
        })
      }
      order.status = 'DELIVERED'
      order.deliveryPartner.status = 'DELIVERED'
      order.deliveryPartner.earningsStatus = 'Payable'
      order.deliveryVerifiedAt = new Date()
      order.deliveryVerificationCode = ''
    }

    await order.save()
    if (action === 'delivered') {
      await User.updateOne(
        { _id: req.user._id, 'deliveryPartnerProfile.activeOrder': order._id },
        { $set: { 'deliveryPartnerProfile.activeOrder': null, 'deliveryPartnerProfile.online': true, 'deliveryPartnerProfile.availabilityStatus': 'AVAILABLE' } },
      )
    }
    if (['picked_up', 'out_for_delivery', 'delivered'].includes(action)) {
      await createNotification({
        userId: order.user,
        type: 'order',
        title: action === 'picked_up' ? 'Your order was picked up' : action === 'out_for_delivery' ? 'Your order is out for delivery' : 'Your order was delivered',
        message: `Order ${order.orderId} status is now "${normalizeOrderStatus(order.status)}".`,
        link: 'tracking',
      })
      const customer = await User.findById(order.user)
      if (customer) {
        const update = action === 'picked_up'
          ? `Order ${order.orderId} has been picked up.`
          : action === 'out_for_delivery'
            ? `Order ${order.orderId} is out for delivery.`
            : `Order ${order.orderId} has been delivered. Please reply with your feedback.`
        await sendUserMessage(customer, `CyberFresh: ${update}`)
      }
    }
    if (action === 'delivered') {
      const vendorIds = [...new Set(order.items.map((item) => item.vendor?.toString()).filter(Boolean))]
      const vendors = await User.find({ _id: { $in: vendorIds } })
      const results = await Promise.allSettled([
        ...vendors.map((vendor) => sendUserMessage(
          vendor,
          `CyberFresh: Order ${order.orderId} has been delivered to the customer.`,
        )),
        sendUserMessage(
          req.user,
          `CyberFresh: Thank you for delivering order ${order.orderId}. Your delivery earnings are now payable.`,
        ),
      ])
      for (const result of results) {
        if (result.status === 'rejected') {
          console.error('Delivery completion message failed:', result.reason)
        }
      }
    }
    res.json({ order: serializeOrderForClient(order) })
  } catch (error) {
    console.error('Delivery job update error:', error)
    res.status(500).json({ message: error.message || 'Could not update delivery.' })
  }
})

export default router
