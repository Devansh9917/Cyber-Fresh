import express from 'express'
import {
  register,
  login,
  adminLogin,
  me,
  googleAuth,
  forgotPassword,
  resetPassword,
  resetPasswordWithOtp,
  changePassword,
  updateProfile,
  updateVendorPaymentDetails,
  updateTheme,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/admin-login', adminLogin)
router.post('/google', googleAuth)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.post('/reset-password-otp', resetPasswordWithOtp)

// Authenticated routes
router.get('/me', protect, me)
router.patch('/change-password', protect, changePassword)
router.patch('/profile', protect, updateProfile)
router.patch('/vendor-payment-details', protect, updateVendorPaymentDetails)
router.patch('/theme', protect, updateTheme)

export default router
