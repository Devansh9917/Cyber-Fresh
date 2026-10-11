import express from 'express'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  scanFreshness,
} from '../controllers/productController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getProducts)
router.post('/freshness-scan', protect, restrictTo('vendor'), scanFreshness)
router.get('/:id', getProduct)
router.post('/', protect, restrictTo('vendor'), createProduct)
router.patch('/:id', protect, restrictTo('vendor'), updateProduct)
router.patch('/:id/stock', protect, restrictTo('vendor'), updateStock)
router.delete('/:id', protect, restrictTo('vendor'), deleteProduct)

export default router
