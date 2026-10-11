import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env')
dotenv.config({ path: envPath })

const knownSeedVendorEmails = [
  'greenvalley@cyberfresh.in',
  'organicroots@cyberfresh.in',
  'sunrisegardens@cyberfresh.in',
  'exoticgreens@cyberfresh.in',
  'berrybliss@cyberfresh.in',
]
const confirmCleanup = process.argv.includes('--confirm-demo-cleanup')

async function main() {
  const connection = await connectDB()
  if (!connection) throw new Error('MongoDB is unavailable; no cleanup was performed.')

  const vendors = await User.find({
    role: 'vendor',
    email: { $in: knownSeedVendorEmails },
  }).select('_id name email')

  if (vendors.length === 0) {
    console.log('No known seed vendor accounts were found. No data was changed.')
    return
  }

  let deletedVendors = 0
  let deletedProducts = 0
  for (const vendor of vendors) {
    const products = await Product.find({ vendor: vendor._id }).select('_id name')
    const productIds = products.map((product) => product._id)
    const referencedByOrder = await Order.exists({
      $or: [
        { 'items.vendor': vendor._id },
        { 'items.product': { $in: productIds } },
      ],
    })

    console.log(`${confirmCleanup ? 'Candidate' : 'Dry run'}: ${vendor.email} (${vendor.name}), ${products.length} linked products${referencedByOrder ? ', referenced by an order and will be skipped' : ''}`)

    if (!confirmCleanup || referencedByOrder) continue

    const productResult = await Product.deleteMany({ vendor: vendor._id })
    const vendorResult = await User.deleteOne({ _id: vendor._id, role: 'vendor' })
    deletedProducts += productResult.deletedCount || 0
    deletedVendors += vendorResult.deletedCount || 0
  }

  if (!confirmCleanup) {
    console.log('Dry run only. No data was changed. Re-run with --confirm-demo-cleanup to remove unreferenced known seed records.')
  } else {
    console.log(`Cleanup complete: removed ${deletedVendors} known seed vendors and ${deletedProducts} linked products. Order-referenced records were preserved.`)
  }
}

main()
  .catch((error) => {
    console.error('Demo data cleanup failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
  })
