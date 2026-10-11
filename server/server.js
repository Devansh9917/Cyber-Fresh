import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import emailRoutes from './routes/emailRoutes.js'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import reminderRoutes from './routes/reminderRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import donationRoutes from './routes/donationRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import userRoutes from './routes/userRoutes.js'
import deliveryRoutes from './routes/deliveryRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import supportRoutes from './routes/supportRoutes.js'

import { getVendorInventory } from './controllers/productController.js'
import { protect, restrictTo } from './middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()

const configuredClientOrigin = process.env.CLIENT_ORIGIN
app.use(
  cors({
    origin: (origin, callback) => {
      const isLocalDevelopmentOrigin = !origin || /^https?:\/\/localhost(?::\d+)?$/.test(origin)
      const isConfiguredOrigin = configuredClientOrigin && origin === configuredClientOrigin
      callback(null, isLocalDevelopmentOrigin || isConfiguredOrigin)
    },
    credentials: true,
  })
)

// Parse JSON and increase limit for base64 photo uploads
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve uploaded static files securely
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Mount application routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/donations', donationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/users', userRoutes)
app.use('/api/delivery', deliveryRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/support', supportRoutes)
app.use('/api/emails', emailRoutes)
// Vendor's own inventory endpoint
app.get('/api/vendor/inventory', protect, restrictTo('vendor'), getVendorInventory)

const frontendDistPath = path.resolve(__dirname, '../dist')
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath))

  app.get(/^(?!\/api).*/, (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(frontendDistPath, 'index.html'))
  })
}

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// Central error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 3000

const startServer = async () => {
  const dbConnection = await connectDB()
  if (!dbConnection) {
    console.warn('Database is offline; the server will stay up for health checks, but database-backed routes will not work until MongoDB is reachable.')
  }

  app.listen(PORT, () => console.log(`Cyber Fresh Server running on http://localhost:${PORT}`))
}

startServer()
