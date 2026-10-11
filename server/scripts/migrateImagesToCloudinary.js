import dotenv from 'dotenv'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import connectDB from '../config/db.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { uploadImageToCloudinary } from '../utils/cloudinary.js'

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const uploadsDir = path.join(serverDir, 'uploads')
dotenv.config({ path: path.resolve(serverDir, '../.env') })

function getLegacyFilename(imageUrl) {
  if (typeof imageUrl !== 'string' || !imageUrl) return null

  try {
    const url = new URL(imageUrl, 'http://localhost')
    if (!url.pathname.startsWith('/uploads/')) return null
    return path.basename(decodeURIComponent(url.pathname))
  } catch {
    return null
  }
}

async function migrateImage(imageUrl, folder, publicId) {
  const filename = getLegacyFilename(imageUrl)
  if (!filename) return null

  const buffer = await fs.readFile(path.join(uploadsDir, filename))
  return uploadImageToCloudinary(buffer, { folder, publicId })
}

async function migrate() {
  const connection = await connectDB()
  if (!connection) {
    throw new Error('Could not connect to MongoDB. Check MONGO_URI before running this migration.')
  }

  let migrated = 0
  let missing = 0

  for (const product of await Product.find({ image: /\/uploads\// })) {
    const filename = getLegacyFilename(product.image)
    if (!filename) continue
    try {
      const imageUrl = await migrateImage(product.image, 'cyber-fresh/products', `product_${product._id}`)
      if (imageUrl) {
        product.image = imageUrl
        await product.save()
        migrated += 1
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`Missing local image for product ${product._id}: ${filename}`)
        missing += 1
        continue
      }
      throw error
    }
  }

  const users = await User.find({
    $or: [
      { avatar: /\/uploads\// },
      { 'paymentDetails.qrCodeUrl': /\/uploads\// },
      { 'deliveryPartnerProfile.profileImage': /\/uploads\// },
    ],
  })

  for (const user of users) {
    const imageFields = [
      ['avatar', user.avatar, 'cyber-fresh/avatars', `avatar_${user._id}`],
      ['paymentDetails.qrCodeUrl', user.paymentDetails?.qrCodeUrl, 'cyber-fresh/vendor-qr', `vendor_qr_${user._id}`],
      ['deliveryPartnerProfile.profileImage', user.deliveryPartnerProfile?.profileImage, 'cyber-fresh/avatars', `delivery_partner_${user._id}`],
    ]

    for (const [field, oldUrl, folder, publicId] of imageFields) {
      const filename = getLegacyFilename(oldUrl)
      if (!filename) continue
      try {
        const imageUrl = await migrateImage(oldUrl, folder, publicId)
        if (imageUrl) {
          user.set(field, imageUrl)
          migrated += 1
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.warn(`Missing local image for user ${user._id} (${field}): ${filename}`)
          missing += 1
          continue
        }
        throw error
      }
    }

    await user.save()
  }

  console.log(`Image migration finished. Migrated: ${migrated}; local files missing: ${missing}.`)
  await connection.disconnect()
}

migrate().catch((error) => {
  console.error('Image migration failed:', error.message)
  process.exitCode = 1
})
