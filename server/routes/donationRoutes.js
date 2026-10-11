import express from 'express'
import mongoose from 'mongoose'
import { randomInt } from 'node:crypto'
import { protect, restrictTo } from '../middleware/auth.js'
import Donation from '../models/Donation.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { createNotification } from '../utils/notifications.js'
import { sendUserMessage } from '../utils/messageDispatch.js'
import { isEmailConfigured, sendEmail } from '../utils/email.js'

const router = express.Router()
router.use(protect)

// POST /api/donations — Vendor offers near-expiry products for donation (Requirement 24 & 25)
router.post('/', restrictTo('vendor'), async (req, res) => {
  let session
  try {
    const { productId, quantity, expiryDate } = req.body
    if (!mongoose.isValidObjectId(productId) || !Number.isInteger(Number(quantity)) || Number(quantity) < 1 || typeof expiryDate !== 'string' || !expiryDate.trim()) {
      return res.status(400).json({ message: 'Select a product, positive whole-number quantity, and expiry date.' })
    }

    const parsedExpiry = new Date(expiryDate)
    if (Number.isNaN(parsedExpiry.getTime())) {
      return res.status(400).json({ message: 'Enter a valid expiry date.' })
    }

    const donationQuantity = Number(quantity)
    session = await mongoose.startSession()
    let donation
    await session.withTransaction(async () => {
      const product = await Product.findOne({
        _id: productId,
        vendor: req.user._id,
        status: 'Active',
      }).session(session)
      if (!product) {
        const error = new Error('Product not found in your active inventory.')
        error.status = 404
        throw error
      }
      if (product.stock < donationQuantity) {
        const error = new Error(`${product.name} does not have enough available stock to donate.`)
        error.status = 409
        throw error
      }

      const remainingStock = product.stock - donationQuantity
      const update = await Product.updateOne(
        { _id: product._id, vendor: req.user._id, stock: { $gte: donationQuantity } },
        {
          $inc: { stock: -donationQuantity },
          $set: { stockStatus: remainingStock <= 0 ? 'Out of Stock' : remainingStock < 15 ? 'Low Stock' : 'In Stock' },
        },
        { session }
      )
      if (update.modifiedCount !== 1) {
        const error = new Error('Product stock changed while creating this donation. Please retry.')
        error.status = 409
        throw error
      }

      const [createdDonation] = await Donation.create([{
        vendor: req.user._id,
        productRef: product._id,
        product: product.name,
        quantity: `${donationQuantity} ${product.unit}`,
        freshnessScore: product.freshnessScore,
        expiryDate: parsedExpiry.toISOString().slice(0, 10),
        status: 'Pending Pickup',
      }], { session })
      donation = createdDonation
    })
    await session.endSession()
    session = null

    // Notify all active NGOs
    const ngos = await User.find({ role: 'ngo', status: 'Active' })
    await Promise.allSettled(ngos.map((ngo) => createNotification({
        userId: ngo._id,
        type: 'donation',
        title: 'New Donation Available',
        message: `${req.user.businessName || req.user.name} has offered ${donation.quantity} of ${donation.product} for pickup.`,
        link: 'available',
      })))
    await Promise.allSettled(ngos.map((ngo) => sendUserMessage(
      ngo,
      `CyberFresh: ${req.user.businessName || req.user.name} offered ${donation.quantity} of ${donation.product} for NGO pickup.`,
    )))

    res.status(201).json(donation)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  } finally {
    if (session) await session.endSession()
  }
})

// GET /api/donations/available — NGO sees pending donations
router.get('/available', restrictTo('ngo'), async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'Pending Pickup' })
      .populate('vendor', 'name businessName phone address')
      .sort({ createdAt: -1 })
    res.json(donations)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/donations/:id/accept — NGO accepts a donation
router.patch('/:id/accept', restrictTo('ngo'), async (req, res) => {
  try {
    const verificationCode = String(randomInt(100000, 1000000))
    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.id, status: 'Pending Pickup' },
      {
        $set: {
          status: 'Accepted',
          ngo: req.user._id,
          ngoName: req.user.ngoName || req.user.name,
          deliveryVerificationCode: verificationCode,
          deliveryVerificationAttempts: 0,
          deliveryPartner: { status: 'PENDING' },
        },
      },
      { new: true }
    ).select('+deliveryVerificationCode')
    if (!donation) {
      const exists = await Donation.exists({ _id: req.params.id })
      return res.status(exists ? 409 : 404).json({
        message: exists ? 'This donation has already been accepted or delivered.' : 'Donation not found.',
      })
    }

    // Notify the vendor
    await createNotification({
      userId: donation.vendor,
      type: 'donation',
      title: 'Donation Accepted! 🤝',
      message: `${req.user.ngoName || req.user.name} has accepted your donation of ${donation.product}. Prepare for pickup.`,
      link: 'donations',
    })
    const vendor = await User.findById(donation.vendor)
    if (vendor) {
      await sendUserMessage(
        vendor,
        `CyberFresh: ${req.user.ngoName || req.user.name} accepted your donation of ${donation.product}. Please prepare it for pickup.`,
      )
    }

    await createNotification({
      userId: req.user._id,
      type: 'donation',
      title: 'Your delivery verification code',
      message: `Keep this code private and give it to the delivery partner only when your donation arrives: ${verificationCode}`,
      link: 'history',
    })
    if (isEmailConfigured() && req.user.email) {
      const emailResult = await sendEmail({
        to: req.user.email,
        subject: `CyberFresh — NGO pickup code for ${donation.product}`,
        text: `Your delivery verification code is ${verificationCode}. Give it to the delivery partner only when your donation arrives.`,
        html: `<p>Your delivery verification code for <strong>${donation.product}</strong> is <strong>${verificationCode}</strong>.</p><p>Give this code to the delivery partner only when your donation arrives.</p>`,
      })
      if (!emailResult.sent) console.error('[Donation] Could not email pickup code:', emailResult.message)
    }
    const messageResult = await sendUserMessage(
      req.user,
      `CyberFresh: Your verification code for the ${donation.product} donation pickup is ${verificationCode}. Give it to the delivery partner only when your donation arrives.`,
    )
    if (messageResult.some((result) => !result.sent && result.configured)) {
      console.error('[Donation] One or more configured channels could not deliver the NGO pickup code.')
    }

    res.json(donation)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/donations/:id/deliver — Mark as delivered / completed
router.patch('/:id/deliver', restrictTo('ngo', 'vendor'), async (req, res) => {
  res.status(403).json({ message: 'Only the assigned delivery partner can complete this donation after verifying the NGO pickup code.' })
})

// GET /api/donations/mine — Vendor's donation history
router.get('/mine', restrictTo('vendor'), async (req, res) => {
  try {
    const donations = await Donation.find({ vendor: req.user._id })
      .populate('ngo', 'name ngoName phone')
      .sort({ createdAt: -1 })
    res.json(donations)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/donations/history — NGO's accepted history
router.get('/history', restrictTo('ngo'), async (req, res) => {
  try {
    const donations = await Donation.find({ ngo: req.user._id })
      .select('+deliveryVerificationCode')
      .populate('vendor', 'name businessName phone address')
      .sort({ createdAt: -1 })
    await Promise.all(donations.map(async (donation) => {
      if (donation.status === 'Accepted' && !donation.deliveryVerificationCode) {
        donation.deliveryVerificationCode = String(randomInt(100000, 1000000))
        await donation.save()
      }
    }))
    res.json(donations)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/donations/impact — NGO impact statistics
router.get('/impact', restrictTo('ngo'), async (req, res) => {
  try {
    const completed = await Donation.find({ ngo: req.user._id, status: { $in: ['Accepted', 'Delivered'] } })
    const totalMeals = completed.reduce((sum, d) => sum + (d.mealsSaved || 0), 0)
    const totalCO2 = completed.reduce((sum, d) => sum + (d.co2Saved || 0), 0)

    res.json({
      totalDonations: completed.length,
      mealsDistributed: totalMeals,
      co2Offset: totalCO2,
      pickupsDone: completed.filter(d => d.status === 'Delivered').length,
      pendingPickups: completed.filter(d => d.status === 'Accepted').length,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
