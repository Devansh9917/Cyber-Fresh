/**
 * DEVELOPMENT SEED SCRIPT ONLY
 * WARNING: This script clears and seeds mock vendors and products.
 * It must NEVER be run in production or automatically on server startup.
 * To execute manually for local dev testing: npm run seed -- --confirm
 */

import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') })

if (process.env.NODE_ENV === 'production') {
  console.error('Seeding is disabled in production.')
  process.exit(1)
}

if (!process.argv.includes('--confirm')) {
  console.log('================================================================');
  console.log('[DEVELOPMENT ONLY] Database Seed Script');
  console.log('To confirm seeding sample development data, run:');
  console.log('  npm run seed -- --confirm');
  console.log('================================================================');
  process.exit(0);
}

const vendorSeeds = [
  { name: 'Suresh Kumar', email: 'greenvalley@cyberfresh.in', businessName: 'Green Valley Farms', category: 'Mixed', verified: true },
  { name: 'Meena Gupta', email: 'organicroots@cyberfresh.in', businessName: 'Organic Roots', category: 'Organic', verified: true },
  { name: 'Ramesh Yadav', email: 'sunrisegardens@cyberfresh.in', businessName: 'Sunrise Gardens', category: 'Vegetables', verified: true },
  { name: 'Poonam Singh', email: 'exoticgreens@cyberfresh.in', businessName: 'Exotic Greens', category: 'Exotic', verified: false },
  { name: 'Ravi Nair', email: 'berrybliss@cyberfresh.in', businessName: 'Berry Bliss', category: 'Berries', verified: true },
]

const vendorIndexByName = {
  'Green Valley Farms': 0,
  'Organic Roots': 1,
  'Sunrise Gardens': 2,
  'Exotic Greens': 3,
  'Berry Bliss': 4,
}

const productSeeds = [
  { name: 'Alphonso Mangoes', category: 'Fruits', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop&auto=format', freshnessScore: 94, shelfLife: '4 days', expiryCountdown: '4 days', harvestDate: 'Aug 3, 2026', vendorName: 'Green Valley Farms', rating: 4.8, distance: '1.2 km', stock: 48, originalPrice: 280, discountedPrice: 199, discount: 29, deliveryTime: '30 min', unit: 'kg', organic: true, tags: ['Premium', 'Sweet'], description: 'Sun-ripened Alphonso mangoes from Ratnagiri, known for their rich aroma and saffron-colored pulp.' },
  { name: 'Baby Spinach', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop&auto=format', freshnessScore: 88, shelfLife: '3 days', expiryCountdown: '3 days', harvestDate: 'Aug 4, 2026', vendorName: 'Organic Roots', rating: 4.6, distance: '0.8 km', stock: 32, originalPrice: 80, discountedPrice: 59, discount: 26, deliveryTime: '25 min', unit: '250g', organic: true, tags: ['Organic', 'Fresh'], description: 'Tender baby spinach leaves, triple-washed and ready to eat.' },
]

async function seed() {
  await connectDB()

  console.log('Clearing existing development vendor/product data...')
  await Promise.all([
    User.deleteMany({ role: 'vendor', email: { $in: vendorSeeds.map(v => v.email) } }),
    Product.deleteMany({ vendorName: { $in: vendorSeeds.map(v => v.businessName) } }),
  ])

  console.log('Creating development vendor accounts (password: Vendor@12345)...')
  const createdVendors = await User.create(
    vendorSeeds.map(v => ({ ...v, role: 'vendor', password: 'Vendor@12345', status: 'Active' }))
  )

  console.log('Creating development products...')
  const products = productSeeds.map(p => ({
    ...p,
    vendor: createdVendors[vendorIndexByName[p.vendorName]]._id,
    stockStatus: p.stock <= 0 ? 'Out of Stock' : p.stock < 15 ? 'Low Stock' : 'In Stock',
  }))
  await Product.insertMany(products)

  console.log(`Seeded ${createdVendors.length} vendors and ${products.length} products for development.`)
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
