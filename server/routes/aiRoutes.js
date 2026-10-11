import express from 'express'
import { protect, restrictTo } from '../middleware/auth.js'
import { chatWithCyberFresh } from '../controllers/aiController.js'

const router = express.Router()

router.use(protect)
router.use(restrictTo('customer', 'vendor', 'ngo', 'delivery_partner', 'admin'))
router.post('/chat', chatWithCyberFresh)

export default router
