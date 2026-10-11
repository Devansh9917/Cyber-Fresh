import express from 'express'
import { protect } from '../middleware/auth.js'
import Reminder from '../models/Reminder.js'
import Product from '../models/Product.js'
import mongoose from 'mongoose'

const router = express.Router()
router.use(protect)

// GET my reminders
router.get('/', async (req, res) => {
  const reminders = await Reminder.find({ user: req.user._id }).populate('product')
  res.json(reminders)
})

// POST set a reminder for an out-of-stock product
router.post('/', async (req, res) => {
  const { productId } = req.body
  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: 'Valid product ID is required.' })
  }

  try {
    const product = await Product.findOne({ _id: productId, status: 'Active' })
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    if (product.stock > 0) return res.status(409).json({ message: 'This product is currently in stock.' })

    const reminder = await Reminder.findOneAndUpdate(
      { user: req.user._id, product: product._id, status: 'Waiting' },
      { $setOnInsert: { user: req.user._id, product: product._id, status: 'Waiting' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.status(201).json(reminder)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Could not save reminder.' })
  }
})

router.delete('/:id', async (req, res) => {
  await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  res.json({ message: 'Reminder removed' })
})

export default router
