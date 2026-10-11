import express from 'express'
import { protect } from '../middleware/auth.js'
import User from '../models/User.js'
import { getVendorDeliveryDistances } from '../utils/deliveryDispatch.js'

const router = express.Router()

router.get('/vendors/nearby', async (req, res) => {
  try {
    const { latitude, longitude, address } = req.query
    let destination
    if (latitude !== undefined || longitude !== undefined) {
      const parsedLatitude = Number(latitude)
      const parsedLongitude = Number(longitude)
      if (
        !Number.isFinite(parsedLatitude) ||
        parsedLatitude < -90 ||
        parsedLatitude > 90 ||
        !Number.isFinite(parsedLongitude) ||
        parsedLongitude < -180 ||
        parsedLongitude > 180
      ) {
        return res.status(400).json({ message: 'A valid customer GPS location is required.' })
      }
      destination = { latitude: parsedLatitude, longitude: parsedLongitude }
    } else if (typeof address === 'string' && address.trim() && address.trim().length <= 500) {
      destination = address.trim()
    } else {
      return res.status(400).json({ message: 'Enter a delivery address or share your GPS location.' })
    }

    const vendors = await User.find({ role: 'vendor', status: 'Active' })
      .select('name businessName ownerName category description verified avatar phone address city state pincode links')
      .sort({ verified: -1, createdAt: -1 })
    const distances = await getVendorDeliveryDistances(vendors, destination)
    const distanceByVendor = new Map(distances.map((item) => [item.vendorId.toString(), item]))
    res.json(vendors
      .filter((vendor) => distanceByVendor.get(vendor._id.toString())?.deliverable)
      .map((vendor) => ({
        ...vendor.toObject(),
        deliveryDistanceKm: distanceByVendor.get(vendor._id.toString()).distanceKm,
      })))
  } catch (error) {
    console.error('Nearby vendor lookup failed:', error)
    res.status(error.status || 500).json({ message: error.message || 'Could not verify vendors within the delivery range.' })
  }
})

// GET /api/users/vendors — Public list of active vendors from MongoDB (Requirement 1 & 14)
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', status: 'Active' })
      .select('name businessName ownerName category description verified avatar phone address city state pincode links')
      .sort({ verified: -1, createdAt: -1 })
    res.json(vendors)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/users/ngos — Public list of active NGOs from MongoDB (Requirement 24)
router.get('/ngos', async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo', status: 'Active' })
      .select('name ngoName description avatar phone address city state links')
      .sort({ createdAt: -1 })
    res.json(ngos)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ==========================================
// MULTI-LINK SYSTEM (Requirement 21)
// ==========================================

// GET /api/users/links — Get user's links
router.get('/links', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('links')
    res.json(user?.links || [])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/users/links — Add new link
router.post('/links', protect, async (req, res) => {
  try {
    const { title, url, type = 'Website' } = req.body
    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' })
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i
    if (!urlPattern.test(url.trim())) {
      return res.status(400).json({ message: 'Please enter a valid URL (e.g., https://example.com)' })
    }

    let formattedUrl = url.trim()
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`
    }

    const user = await User.findById(req.user._id)
    const newOrder = user.links.length

    user.links.push({
      title: title.trim(),
      url: formattedUrl,
      type,
      enabled: true,
      order: newOrder,
    })

    await user.save()
    res.status(201).json(user.links)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/users/links/:linkId — Update link
router.patch('/links/:linkId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const link = user.links.id(req.params.linkId)
    if (!link) return res.status(404).json({ message: 'Link not found' })

    const { title, url, type, enabled, order } = req.body
    if (title !== undefined) link.title = title.trim()
    if (url !== undefined) {
      let formattedUrl = url.trim()
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`
      }
      link.url = formattedUrl
    }
    if (type !== undefined) link.type = type
    if (enabled !== undefined) link.enabled = Boolean(enabled)
    if (order !== undefined) link.order = Number(order)

    await user.save()
    res.json(user.links)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/users/links/:linkId — Delete link
router.delete('/links/:linkId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.links.pull({ _id: req.params.linkId })
    await user.save()
    res.json(user.links)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
