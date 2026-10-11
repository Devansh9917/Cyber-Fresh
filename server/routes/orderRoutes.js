import express from 'express'
import {
  createOrder,
  getMyOrders,
  getVendorOrders,
  getOrder,
  updateOrderStatus,
  createDeliveryQuote,
} from '../controllers/orderController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()
router.use(protect)

router.post('/', restrictTo('customer'), createOrder)
router.get('/mine', restrictTo('customer'), getMyOrders)
router.get('/vendor', restrictTo('vendor'), getVendorOrders)
router.post('/delivery-quote', restrictTo('customer'), createDeliveryQuote)
router.get('/:id', getOrder)
router.patch('/:id/status', restrictTo('vendor', 'admin'), updateOrderStatus)

export default router
