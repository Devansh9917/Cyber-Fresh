import express from 'express'
import crypto from 'crypto'
import { protect, restrictTo } from '../middleware/auth.js'
import User from '../models/User.js'
import { uploadImageToCloudinary } from '../utils/cloudinary.js'

const router = express.Router()

const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

function hasExpectedImageSignature(buffer, mimeType) {
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  }
  if (mimeType === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  }
  if (mimeType === 'image/webp') {
    return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
  }
  return false
}

// POST /api/upload/profile-photo — Upload and attach profile photo
router.post('/profile-photo', protect, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body

    if (!imageBase64) {
      return res.status(400).json({ message: 'No image data provided' })
    }

    let detectedMime = mimeType
    let base64Data = imageBase64

    // Handle data:image/png;base64,... format
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,')
      detectedMime = parts[0].replace('data:', '')
      base64Data = parts[1]
    }

    if (!ALLOWED_MIME_TYPES[detectedMime]) {
      return res.status(400).json({
        message: 'Invalid file format. Only JPG, JPEG, PNG, and WEBP are supported.',
      })
    }

    const buffer = Buffer.from(base64Data, 'base64')
    if (buffer.length > MAX_SIZE_BYTES || !hasExpectedImageSignature(buffer, detectedMime)) {
      return res.status(400).json({
        message: 'Invalid image data or file size exceeds 5MB.',
      })
    }

    const publicId = `avatar_${req.user._id}_${Date.now()}`
    const avatarUrl = await uploadImageToCloudinary(buffer, {
      folder: 'cyber-fresh/avatars',
      publicId,
    })

    // Update user's avatar in MongoDB
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl })

    res.json({
      success: true,
      avatarUrl,
      message: 'Profile photo updated successfully',
    })
  } catch (err) {
    console.error('Profile photo upload error:', err)
    res.status(500).json({ message: err.message || 'Failed to upload photo' })
  }
})

// DELETE /api/upload/profile-photo — Remove profile photo
router.delete('/profile-photo', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { avatar: '' })
    res.json({ success: true, message: 'Profile photo removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/upload/product-image — Vendor product image upload
router.post('/product-image', protect, restrictTo('vendor'), async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body

    if (!imageBase64) {
      return res.status(400).json({ message: 'No image data provided' })
    }

    let detectedMime = mimeType
    let base64Data = imageBase64

    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,')
      detectedMime = parts[0].replace('data:', '')
      base64Data = parts[1]
    }

    if (!ALLOWED_MIME_TYPES[detectedMime]) {
      return res.status(400).json({
        message: 'Invalid format. Supported: JPG, JPEG, PNG, WEBP',
      })
    }

    const buffer = Buffer.from(base64Data, 'base64')
    if (buffer.length > MAX_SIZE_BYTES || !hasExpectedImageSignature(buffer, detectedMime)) {
      return res.status(400).json({ message: 'Invalid image data or file size exceeds 5MB.' })
    }

    const publicId = `product_${crypto.randomBytes(8).toString('hex')}_${Date.now()}`
    const imageUrl = await uploadImageToCloudinary(buffer, {
      folder: 'cyber-fresh/products',
      publicId,
    })
    res.json({ success: true, imageUrl })
  } catch (err) {
    console.error('Product image upload error:', err)
    res.status(500).json({ message: err.message || 'Failed to upload image' })
  }
})

// POST /api/upload/vendor-payment-qr — Upload a vendor's payout QR code
router.post('/vendor-payment-qr', protect, restrictTo('vendor'), async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body
    if (!imageBase64) {
      return res.status(400).json({ message: 'Choose a QR code image to upload.' })
    }

    let detectedMime = mimeType
    let base64Data = imageBase64
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,')
      detectedMime = parts[0].replace('data:', '')
      base64Data = parts[1]
    }
    if (!ALLOWED_MIME_TYPES[detectedMime]) {
      return res.status(400).json({ message: 'QR code must be a JPG, PNG, or WEBP image.' })
    }

    const buffer = Buffer.from(base64Data, 'base64')
    if (buffer.length > MAX_SIZE_BYTES || !hasExpectedImageSignature(buffer, detectedMime)) {
      return res.status(400).json({ message: 'Invalid QR image or file size exceeds 5 MB.' })
    }

    const publicId = `vendor_qr_${req.user._id}_${Date.now()}`
    const qrCodeUrl = await uploadImageToCloudinary(buffer, {
      folder: 'cyber-fresh/vendor-qr',
      publicId,
    })
    await User.findByIdAndUpdate(req.user._id, { 'paymentDetails.qrCodeUrl': qrCodeUrl })
    res.json({ success: true, qrCodeUrl, message: 'Vendor payout QR code uploaded.' })
  } catch (err) {
    console.error('Vendor QR upload error:', err)
    res.status(500).json({ message: err.message || 'Failed to upload vendor QR code.' })
  }
})

export default router
