import express from 'express'
import { protect, restrictTo } from '../middleware/auth.js'
import SupportTicket from '../models/SupportTicket.js'

const router = express.Router()

router.use(protect, restrictTo('customer', 'vendor', 'ngo', 'delivery_partner'))

router.post('/', async (req, res) => {
  try {
    const { type, category, subject, message, orderId = '' } = req.body
    if (!['Complaint', 'Feedback'].includes(type)) {
      return res.status(400).json({ message: 'Choose whether this is feedback or a complaint.' })
    }
    if (!['Order', 'Product', 'Payment', 'Delivery', 'Account', 'App', 'Other'].includes(category)) {
      return res.status(400).json({ message: 'Choose a valid feedback or complaint category.' })
    }
    if (typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 120) {
      return res.status(400).json({ message: 'Subject must be between 3 and 120 characters.' })
    }
    if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 4000) {
      return res.status(400).json({ message: 'Details must be between 10 and 4000 characters.' })
    }
    if (typeof orderId !== 'string' || orderId.trim().length > 100) {
      return res.status(400).json({ message: 'Order reference must be 100 characters or fewer.' })
    }

    const ticket = await SupportTicket.create({
      type,
      category,
      subject: subject.trim(),
      message: message.trim(),
      orderId: orderId.trim(),
      reporter: req.user._id,
      reporterName: req.user.name,
      reporterEmail: req.user.email,
      reporterRole: req.user.role,
    })
    res.status(201).json({ ticket, message: 'Your submission has been sent to support.' })
  } catch (error) {
    console.error('Support submission failed:', error)
    res.status(500).json({ message: 'Could not submit your feedback or complaint.' })
  }
})

router.get('/mine', async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(tickets)
  } catch (error) {
    console.error('Support history lookup failed:', error)
    res.status(500).json({ message: 'Could not load your support submissions.' })
  }
})

export default router
