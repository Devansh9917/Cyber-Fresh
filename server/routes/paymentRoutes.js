import express from 'express'
import {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
} from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/config', getPaymentConfig)
router.post('/create-order', protect, createPaymentOrder)
router.post('/verify', protect, verifyPayment)
router.get('/history', protect, getPaymentHistory)

export default router
