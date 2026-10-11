import readline from 'readline'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import { validatePasswordStrength } from '../utils/password.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') })

function promptQuestion(rl, query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function run() {
  console.log('--- Cyber Fresh: Initial Administrator Setup ---')

  // Connect to MongoDB
  await connectDB()

  try {
    // Check whether an admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      console.log('An administrator already exists. Initial admin creation is disabled.')
      await mongoose.disconnect()
      process.exit(1)
    }

    console.log('No administrator exists. Create initial administrator.')

    // Check if arguments were passed via CLI: [name, email, password]
    const args = process.argv.slice(2)
    let name = args[0]
    let email = args[1]
    let password = args[2]

    if (!name || !email || !password) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      name = await promptQuestion(rl, 'Enter Admin Name: ')
      email = await promptQuestion(rl, 'Enter Admin Email: ')
      password = await promptQuestion(rl, 'Enter Admin Password: ')
      const confirmPassword = await promptQuestion(rl, 'Confirm Admin Password: ')

      rl.close()

      if (password !== confirmPassword) {
        console.error('Error: Passwords do not match.')
        await mongoose.disconnect()
        process.exit(1)
      }
    }

    name = name?.trim()
    email = email?.trim().toLowerCase()
    password = password?.trim()

    if (!name || !email || !password) {
      console.error('Error: Name, email, and password are required.')
      await mongoose.disconnect()
      process.exit(1)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('Error: Invalid email format.')
      await mongoose.disconnect()
      process.exit(1)
    }

    // Validate password strength
    const strength = validatePasswordStrength(password)
    if (!strength.isValid) {
      console.error(`Error: Password does not meet security requirements.\n${strength.message}`)
      await mongoose.disconnect()
      process.exit(1)
    }

    // Double check email isn't used by another role
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.error(`Error: An account with email ${email} already exists.`)
      await mongoose.disconnect()
      process.exit(1)
    }

    // Create admin (password is hashed by User schema pre-save hook using bcrypt)
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      status: 'Active',
    })

    console.log('Success: Initial administrator account successfully created!')
    console.log(`Admin ID: ${admin._id}`)
    console.log(`Admin Name: ${admin.name}`)
    console.log(`Admin Email: ${admin.email}`)
    console.log(`Role: ${admin.role}`)

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
    process.exit(0)
  } catch (err) {
    console.error('Failed to create initial admin:', err.message)
    await mongoose.disconnect()
    process.exit(1)
  }
}

run()
