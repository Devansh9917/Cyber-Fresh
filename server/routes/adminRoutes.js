import express from 'express'
import mongoose from 'mongoose'
import { protect, restrictTo } from '../middleware/auth.js'
import User from '../models/User.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Donation from '../models/Donation.js'
import Payment from '../models/Payment.js'
import SupportTicket from '../models/SupportTicket.js'
import { validatePasswordStrength } from '../utils/password.js'
import { createNotification } from '../utils/notifications.js'
import { serializeOrderForClient } from '../utils/orderStatus.js'

const router = express.Router()

// PUBLIC endpoint for landing page stats (Requirement 1 & 26: strictly from MongoDB)
router.get('/public-stats', async (req, res) => {
  try {
    const [customers, vendors, ordersCount, productsCount, donationsCount] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      Order.countDocuments(),
      Product.countDocuments(),
      Donation.countDocuments(),
    ])

    const donationImpact = await Donation.aggregate([
      { $group: { _id: null, meals: { $sum: '$mealsSaved' }, co2: { $sum: '$co2Saved' } } },
    ])

    res.json({
      totalCustomers: customers,
      totalVendors: vendors,
      totalOrders: ordersCount,
      totalProducts: productsCount,
      totalDonations: donationsCount,
      mealsSaved: donationImpact[0]?.meals || 0,
      co2Saved: donationImpact[0]?.co2 || 0,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ALL SUBSEQUENT ADMIN ROUTES REQUIRE AUTHENTICATED ADMINISTRATOR
router.use(protect, restrictTo('admin'))

router.get('/reports', async (req, res) => {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)
    const [
      customers,
      vendors,
      ngos,
      deliveryPartners,
      products,
      orders,
      donations,
      supportTickets,
      monthlyOrders,
      orderStatuses,
      productCategories,
      donationStatuses,
      ticketStatuses,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'delivery_partner' }),
      Product.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            paidRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$total', 0] } },
            paidOrders: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0] } },
          },
        },
      ]),
      Donation.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            mealsSaved: { $sum: '$mealsSaved' },
            co2Saved: { $sum: '$co2Saved' },
          },
        },
      ]),
      SupportTicket.countDocuments(),
      Order.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            orders: { $sum: 1 },
            paidRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$total', 0] } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Donation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      SupportTicket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ])

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    res.json({
      generatedAt: new Date().toISOString(),
      summary: {
        customers,
        vendors,
        ngos,
        deliveryPartners,
        products,
        orders: orders[0]?.count || 0,
        paidOrders: orders[0]?.paidOrders || 0,
        paidRevenue: orders[0]?.paidRevenue || 0,
        donations: donations[0]?.count || 0,
        mealsSaved: donations[0]?.mealsSaved || 0,
        co2Saved: donations[0]?.co2Saved || 0,
        supportTickets,
      },
      monthlyOrders: monthlyOrders.map((item) => ({
        period: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        orders: item.orders,
        paidRevenue: item.paidRevenue,
      })),
      orderStatuses: orderStatuses.map(({ _id, count }) => ({ label: _id || 'Unknown', count })),
      productCategories: productCategories.map(({ _id, count }) => ({ label: _id || 'Uncategorized', count })),
      donationStatuses: donationStatuses.map(({ _id, count }) => ({ label: _id || 'Unknown', count })),
      ticketStatuses: ticketStatuses.map(({ _id, count }) => ({ label: _id || 'Unknown', count })),
    })
  } catch (error) {
    console.error('Admin reports lookup failed:', error)
    res.status(500).json({ message: 'Could not generate reports from current platform data.' })
  }
})

router.get('/support-tickets', async (req, res) => {
  try {
    const { status, type } = req.query
    const filter = {}
    if (status && ['Open', 'In Progress', 'Resolved'].includes(status)) filter.status = status
    if (type && ['Complaint', 'Feedback'].includes(type)) filter.type = type
    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
    res.json(tickets)
  } catch (error) {
    console.error('Admin support lookup failed:', error)
    res.status(500).json({ message: 'Could not load support submissions.' })
  }
})

router.patch('/support-tickets/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid support submission ID.' })
    }
    const { status, adminNote = '' } = req.body
    if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Choose a valid support status.' })
    }
    if (typeof adminNote !== 'string' || adminNote.trim().length > 1000) {
      return res.status(400).json({ message: 'Admin note must be 1000 characters or fewer.' })
    }
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote.trim(),
        resolvedAt: status === 'Resolved' ? new Date() : null,
      },
      { new: true, runValidators: true },
    )
    if (!ticket) return res.status(404).json({ message: 'Support submission not found.' })
    res.json({ ticket, message: 'Support submission updated.' })
  } catch (error) {
    console.error('Admin support update failed:', error)
    res.status(500).json({ message: 'Could not update support submission.' })
  }
})

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('vendor', 'name businessName')
      .sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/stats — Real database statistics only (Requirement 26)
router.get('/stats', async (req, res) => {
  try {
    const [
      totalCustomers,
      totalVendors,
      totalNGOs,
      totalAdmins,
      totalProducts,
      totalOrders,
      totalDonations,
      totalPayments,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'admin' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Donation.countDocuments(),
      Payment.countDocuments(),
    ])

    // Calculate real revenue from paid orders
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ])

    // Calculate real donation impact from MongoDB
    const donationAgg = await Donation.aggregate([
      { $group: { _id: null, meals: { $sum: '$mealsSaved' }, co2: { $sum: '$co2Saved' } } },
    ])

    // Real monthly trend from MongoDB orders
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const monthlyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$total', 0] },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const trendData = monthlyOrders.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
    }))

    // Real category split from MongoDB products
    const categorySplit = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ])

    const colors = {
      Fruits: '#2E7D32',
      Vegetables: '#FF9800',
      Organic: '#81C784',
      Exotic: '#FBC02D',
      Mixed: '#00897B',
      Berries: '#E91E63',
    }

    const categoryData = categorySplit.map(c => ({
      name: c._id || 'General',
      value: c.count,
      fill: colors[c._id] || '#3949AB',
    }))

    res.json({
      totalUsers: totalCustomers + totalVendors + totalNGOs + totalAdmins,
      totalCustomers,
      totalVendors,
      totalNGOs,
      totalAdmins,
      totalProducts,
      totalOrders,
      totalDonations,
      totalPayments,
      revenue: revenueAgg[0]?.total || 0,
      mealsSaved: donationAgg[0]?.meals || 0,
      co2Saved: donationAgg[0]?.co2 || 0,
      wasteReduced: (donationAgg[0]?.meals || 0) * 0.5,
      trendData,
      categoryData,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(500).json({ message: err.message })
  }
})

// ==========================================
// ADMIN MANAGEMENT (Requirements 6, 7, 8, 28)
// ==========================================

// GET /api/admin/admins — List all administrators
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
    res.json(admins)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/admin/admins — Authenticated Admin creates another admin (Requirement 6)
router.post('/admins', async (req, res) => {
  try {
    const { name, email, password, phone, avatar } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email address format' })
    }

    // Validate password strength (Requirement 9)
    const strength = validatePasswordStrength(password)
    if (!strength.isValid) {
      return res.status(400).json({ message: strength.message })
    }

    // Check duplicate email
    const existing = await User.findOne({ email: trimmedEmail })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const newAdmin = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password,
      phone: phone?.trim() || '',
      avatar: avatar?.trim() || '',
      role: 'admin',
      status: 'Active',
    })

    await createNotification({
      userId: newAdmin._id,
      type: 'account',
      title: 'Administrator Account Created ⚡',
      message: `You have been added as an administrator by ${req.user.name}.`,
    })

    const sanitized = newAdmin.toObject()
    delete sanitized.password
    res.status(201).json({ admin: sanitized, message: 'Administrator created successfully' })
  } catch (err) {
    console.error('Error creating admin:', err)
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/admin/admins/:id/status — Enable/Disable admin (Requirement 7 & 8)
router.patch('/admins/:id/status', async (req, res) => {
  try {
    const targetAdmin = await User.findById(req.params.id)
    if (!targetAdmin || targetAdmin.role !== 'admin') {
      return res.status(404).json({ message: 'Administrator not found' })
    }

    const { status } = req.body
    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    // Requirement 8: "The last active administrator cannot be deleted or disabled."
    if (status === 'Suspended') {
      const activeAdminCount = await User.countDocuments({ role: 'admin', status: 'Active' })
      if (activeAdminCount <= 1 && targetAdmin.status === 'Active') {
        return res.status(400).json({
          message: 'Protection Error: The last active administrator cannot be disabled.',
        })
      }

      if (targetAdmin._id.toString() === req.user._id.toString() && activeAdminCount <= 1) {
        return res.status(400).json({
          message: 'Protection Error: You cannot disable your own account when you are the only active administrator.',
        })
      }
    }

    targetAdmin.status = status
    await targetAdmin.save()

    res.json({
      admin: targetAdmin,
      message: `Administrator ${status === 'Active' ? 'enabled' : 'disabled'} successfully`,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/admin/admins/:id — Remove admin (Requirement 7 & 8)
router.delete('/admins/:id', async (req, res) => {
  try {
    const targetAdmin = await User.findById(req.params.id)
    if (!targetAdmin || targetAdmin.role !== 'admin') {
      return res.status(404).json({ message: 'Administrator not found' })
    }

    // Requirement 8: "The last active administrator cannot be deleted or disabled."
    const activeAdminCount = await User.countDocuments({ role: 'admin', status: 'Active' })
    if (activeAdminCount <= 1 && targetAdmin.status === 'Active') {
      return res.status(400).json({
        message: 'Protection Error: The last active administrator cannot be deleted.',
      })
    }

    if (targetAdmin._id.toString() === req.user._id.toString() && activeAdminCount <= 1) {
      return res.status(400).json({
        message: 'Protection Error: You cannot delete your own account when you are the only active administrator.',
      })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Administrator removed successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/admin/admins/:id — Update admin details
router.patch('/admins/:id', async (req, res) => {
  try {
    const targetAdmin = await User.findById(req.params.id)
    if (!targetAdmin || targetAdmin.role !== 'admin') {
      return res.status(404).json({ message: 'Administrator not found' })
    }

    const { name, phone, avatar, address } = req.body
    if (name) targetAdmin.name = name.trim()
    if (phone !== undefined) targetAdmin.phone = phone.trim()
    if (avatar !== undefined) targetAdmin.avatar = avatar
    if (address !== undefined) targetAdmin.address = address

    await targetAdmin.save()
    res.json({ admin: targetAdmin, message: 'Administrator updated successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ==========================================
// USER MANAGEMENT (Requirement 27)
// ==========================================

// GET /api/admin/users — List customers/vendors/ngos/admins with search & filter
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query
    const filter = {}

    if (role && ['customer', 'vendor', 'ngo', 'admin', 'delivery_partner'].includes(role)) {
      filter.role = role
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })

    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/admin/users/:id/status — Suspend or Activate user
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (!['Active', 'Suspended', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (
      user.role === 'delivery_partner' &&
      status !== 'Active' &&
      user.deliveryPartnerProfile?.activeOrder
    ) {
      return res.status(409).json({ message: 'This partner has an active delivery. Resolve it before suspending the account.' })
    }

    if (user.role === 'admin' && status === 'Suspended') {
      const activeAdminCount = await User.countDocuments({ role: 'admin', status: 'Active' })
      if (activeAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot suspend the last active administrator.' })
      }
    }

    user.status = status
    if (user.role === 'delivery_partner') {
      user.deliveryPartnerProfile.online = false
      user.deliveryPartnerProfile.availabilityStatus = 'UNAVAILABLE'
    }
    await user.save()

    res.json({ user, message: `User status updated to ${status}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.patch('/delivery-partners/:id/approval', async (req, res) => {
  try {
    const { approvalStatus, reason } = req.body
    const allowed = ['APPROVED', 'REJECTED']
    if (!allowed.includes(approvalStatus)) {
      return res.status(400).json({ message: 'Approval status must be APPROVED or REJECTED.' })
    }

    const partner = await User.findOne({ _id: req.params.id, role: 'delivery_partner' })
    if (!partner) return res.status(404).json({ message: 'Delivery partner not found.' })

    partner.deliveryPartnerProfile.approvalStatus = approvalStatus
    partner.deliveryPartnerProfile.online = false
    partner.deliveryPartnerProfile.availabilityStatus = 'UNAVAILABLE'
    partner.status = approvalStatus === 'APPROVED' ? 'Active' : 'Pending'
    if (reason) partner.deliveryPartnerProfile.notes = reason
    await partner.save()

    await createNotification({
      userId: partner._id,
      type: 'account',
      title: approvalStatus === 'APPROVED' ? 'Delivery partner approved' : 'Delivery partner application rejected',
      message: approvalStatus === 'APPROVED'
        ? 'Your delivery partner account has been approved and you can go online.'
        : `Your delivery partner application was not approved${reason ? `: ${reason}` : '.'}`,
      link: 'delivery',
    })

    res.json({ user: partner, message: `Delivery partner ${approvalStatus.toLowerCase()}.` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/delivery-partners', async (req, res) => {
  try {
    const partners = await User.find({ role: 'delivery_partner' })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
    res.json(partners)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/admin/vendors/:id/verify — Verify or Unverify vendor
router.patch('/vendors/:id/verify', async (req, res) => {
  try {
    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'vendor' },
      { verified: Boolean(req.body.verified) },
      { new: true }
    ).select('-password')

    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })

    await createNotification({
      userId: vendor._id,
      type: 'vendor',
      title: vendor.verified ? 'Vendor Verified! ✅' : 'Vendor Status Updated',
      message: vendor.verified
        ? 'Congratulations! Your vendor profile has been verified by Cyber Fresh administrators.'
        : 'Your vendor verification status was updated by administration.',
    })

    res.json(vendor)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/orders — All platform orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
    res.json(orders.map((order) => serializeOrderForClient(order)))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/delivery-payouts', async (req, res) => {
  try {
    const payouts = await Order.find({
      'deliveryPartner.earningsStatus': { $in: ['Payable', 'Paid'] },
    })
      .populate('deliveryPartner.user', 'name phone email')
      .populate('deliveryPartner.paidBy', 'name email')
      .sort({ 'deliveryPartner.paidAt': -1, updatedAt: -1 })
    res.json(payouts.map((order) => serializeOrderForClient(order)))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.patch('/orders/:id/delivery-payout', async (req, res) => {
  try {
    if (req.body?.reference !== undefined && typeof req.body.reference !== 'string') {
      return res.status(400).json({ message: 'Payout reference must be text.' })
    }
    const reference = typeof req.body?.reference === 'string' ? req.body.reference.trim() : ''
    if (reference.length > 100) {
      return res.status(400).json({ message: 'Payout reference must be 100 characters or fewer.' })
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'DELIVERED',
        'deliveryPartner.user': { $ne: null },
        'deliveryPartner.earningsStatus': 'Payable',
      },
      {
        $set: {
          'deliveryPartner.earningsStatus': 'Paid',
          'deliveryPartner.paidAt': new Date(),
          'deliveryPartner.paidBy': req.user._id,
          'deliveryPartner.payoutReference': reference,
        },
      },
      { new: true, runValidators: true },
    )
      .populate('deliveryPartner.user', 'name phone email')
      .populate('deliveryPartner.paidBy', 'name email')

    if (!order) {
      const existingOrder = await Order.findById(req.params.id).select('status deliveryPartner.earningsStatus')
      if (!existingOrder) return res.status(404).json({ message: 'Order not found.' })
      return res.status(409).json({ message: 'Only an unpaid, delivered partner order can be recorded as paid.' })
    }

    const deliveryPartnerId = order.deliveryPartner.user?._id
    if (deliveryPartnerId) {
      try {
        await createNotification({
          userId: deliveryPartnerId,
          type: 'order',
          title: 'Delivery payout recorded',
          message: `Your delivery earnings of ₹${order.deliveryPartner.earnings} for order ${order.orderId} have been marked paid by the administrator.`,
          link: 'delivery-jobs',
        })
      } catch (notificationError) {
        console.error('Delivery payout notification failed:', notificationError)
      }
    }

    res.json(serializeOrderForClient(order))
  } catch (err) {
    console.error('Delivery payout update failed:', err)
    res.status(500).json({ message: err.message || 'Could not record delivery payout.' })
  }
})

// GET /api/admin/payments — All platform payments (Requirement 19)
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    res.json(payments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
