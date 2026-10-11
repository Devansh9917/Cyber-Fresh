import express from 'express'
import { protect } from '../middleware/auth.js'
import Notification from '../models/Notification.js'

const router = express.Router()
router.use(protect)

// GET /api/notifications — User's notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/notifications/:id/read — Mark single notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    )
    if (!n) return res.status(404).json({ message: 'Notification not found' })
    res.json(n)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/notifications/read-all — Mark all as read
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { read: true })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/notifications/:id — Delete notification
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    res.json({ message: 'Notification deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/notifications/all — Clear all
router.delete('/all', async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id })
    res.json({ message: 'All notifications cleared' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
