import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import { validatePasswordStrength } from '../utils/password.js'
import { sendEmail, isEmailConfigured } from '../utils/email.js'
import { createNotification } from '../utils/notifications.js'
import { sendUserMessage } from '../utils/messageDispatch.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function sanitize(user) {
  const obj = user.toObject ? user.toObject() : { ...user }
  delete obj.password
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpire
  return obj
}

// Allowed roles for public registration — ADMIN IS STRICTLY EXCLUDED
const ALLOWED_PUBLIC_ROLES = ['customer', 'vendor', 'ngo', 'delivery_partner']

// POST /api/auth/register — Public registration for customer, vendor, NGO only
export async function register(req, res) {
  try {
    const { name, email, password, phone, role, businessName, ownerName, ngoName, category, address, city, state, pincode } = req.body

    // Requirement 2 & 5 & 29: Reject any attempt to register as admin or invalid role
    if (role === 'admin' || !ALLOWED_PUBLIC_ROLES.includes(role)) {
      return res.status(403).json({
        message: 'Administrator registration is not permitted through public registration. Admin accounts can only be created by an authenticated administrator.',
      })
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' })
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email address format' })
    }

    // Requirement 9: Admin and user password strength
    const strength = validatePasswordStrength(password)
    if (!strength.isValid) {
      return res.status(400).json({ message: strength.message })
    }

    // Check duplicate email
    const existing = await User.findOne({ email: trimmedEmail })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const userData = {
      name: name.trim(),
      email: trimmedEmail,
      password,
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      city: city?.trim() || '',
      state: state?.trim() || '',
      pincode: pincode?.trim() || '',
      role, // Guaranteed to be customer, vendor, or ngo
      status: role === 'delivery_partner' ? 'Pending' : 'Active',
    }

    if (role === 'vendor') {
      userData.businessName = businessName?.trim() || name.trim()
      userData.ownerName = ownerName?.trim() || name.trim()
      userData.category = category?.trim() || 'Mixed'
      userData.verified = false
    } else if (role === 'ngo') {
      userData.ngoName = ngoName?.trim() || businessName?.trim() || name.trim()
    } else if (role === 'delivery_partner') {
      userData.deliveryPartnerProfile = {
        approvalStatus: 'PENDING',
        online: false,
        availabilityStatus: 'UNAVAILABLE',
      }
    }

    const user = await User.create(userData)
    const token = signToken(user)

    // Create welcome notification
    await createNotification({
      userId: user._id,
      type: 'account',
      title: 'Welcome to Cyber Fresh! 🌱',
      message: `Your ${role} account has been created successfully. Explore fresh products and sustainable commerce!`,
    })

    // Notify administrators if a new vendor registered
    if (role === 'vendor') {
      const admins = await User.find({ role: 'admin' })
      for (const admin of admins) {
        await createNotification({
          userId: admin._id,
          type: 'vendor',
          title: 'New Vendor Registration 🏪',
          message: `Vendor "${user.businessName || user.name}" has registered and is awaiting verification.`,
          link: 'vendors',
        })
      }
    }

    // Optional email if configured
    if (isEmailConfigured()) {
      sendEmail({
        to: user.email,
        subject: 'Welcome to Cyber Fresh!',
        html: `<h2>Welcome to Cyber Fresh, ${user.name}!</h2><p>Your account as a <strong>${role}</strong> is now active.</p>`,
      }).catch(() => {})
    }

    res.status(201).json({ token, user: sanitize(user) })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ message: err.message || 'Server error during registration' })
  }
}

// POST /api/auth/login — Universal login
export async function login(req, res) {
  try {
    const { email, password, role } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    if (!ALLOWED_PUBLIC_ROLES.includes(role)) {
      return res.status(403).json({ message: 'Select a customer, vendor, NGO, or delivery partner account to sign in.' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ message: 'Your account is suspended. Please contact platform administration.' })
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}, not ${role}.`,
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    const token = signToken(user)
    res.json({ token, user: sanitize(user) })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: err.message || 'Server error during login' })
  }
}

// POST /api/auth/admin-login — Dedicated Admin Login (Requirement 4)
export async function adminLogin(req, res) {
  try {
    const { identifier, email, password } = req.body
    const submittedIdentifier = (identifier || email || '').trim().toLowerCase()
    if (!submittedIdentifier || !password) {
      return res.status(400).json({ message: 'Admin identifier and password are required' })
    }

    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const configuredUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase()
    const isConfiguredIdentifier = submittedIdentifier === configuredEmail || submittedIdentifier === configuredUsername
    const lookupEmail = configuredUsername && submittedIdentifier === configuredUsername
      ? configuredEmail
      : submittedIdentifier

    if (!lookupEmail || !isConfiguredIdentifier) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    let user = await User.findOne({ email: lookupEmail, role: 'admin' }).select('+password')
    if (!user) {
      user = await User.findOne({ role: 'admin', status: 'Active' }).sort({ createdAt: 1 }).select('+password')
    }

    const databasePasswordValid = user ? await user.comparePassword(password) : false
    const configuredPasswordValid = process.env.ADMIN_PASSWORD_HASH
      ? await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
      : false
    if (!user || (!databasePasswordValid && !(isConfiguredIdentifier && configuredPasswordValid))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    // Requirement 4: Verify that the user's role is actually admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied: You do not have permission to access the admin portal.',
      })
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ message: 'Your administrator account has been disabled. Please contact the primary administrator.' })
    }

    user.lastLogin = new Date()
    await user.save()

    const token = signToken(user)
    res.json({ token, user: sanitize(user) })
  } catch (err) {
    console.error('Admin login error:', err)
    res.status(500).json({ message: err.message || 'Server error during admin login' })
  }
}

// GET /api/auth/me
export async function me(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: sanitize(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/google — Google OAuth (Requirement 38)
export async function googleAuth(req, res) {
  try {
    const { credential, role } = req.body
    if (!credential || !role) {
      return res.status(400).json({ message: 'credential and role are required' })
    }

    // Requirement 38: OAuth cannot accidentally create an admin
    if (!['customer', 'vendor', 'ngo'].includes(role)) {
      return res.status(403).json({
        message: 'Google authentication is not enabled for this account type.',
      })
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google sign-in is not configured on the server' })
    }

    let payload
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      payload = ticket.getPayload()
    } catch (err) {
      return res.status(401).json({ message: 'Invalid Google credential' })
    }

    if (!payload?.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified' })
    }

    const email = payload.email.toLowerCase()
    let user = await User.findOne({ email })

    if (user) {
      if (user.role !== role) {
        return res.status(409).json({
          message: `This account is registered as ${user.role}, not ${role}.`,
        })
      }
      if (user.status === 'Suspended') {
        return res.status(403).json({ message: 'Your account is suspended.' })
      }
      if (!user.googleId) {
        user.googleId = payload.sub
        if (payload.picture && !user.avatar) user.avatar = payload.picture
        user.lastLogin = new Date()
        await user.save()
      }
    } else {
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        role, // Only customer, vendor, or ngo
        authProvider: 'google',
        googleId: payload.sub,
        avatar: payload.picture || '',
        status: 'Active',
        lastLogin: new Date(),
      })
    }

    const token = signToken(user)
    res.json({ token, user: sanitize(user) })
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/forgot-password — Requirement 10
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email address is required' })

    const emailConfigured = isEmailConfigured()
    if (!emailConfigured) {
      return res.status(503).json({ message: 'Password reset delivery is not configured.' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) {
      return res.json({ message: 'If an account exists for that email, reset instructions will be sent.' })
    }

    const otp = crypto.randomInt(100000, 1000000).toString()
    user.passwordResetOtpHash = await bcrypt.hash(otp, 10)
    user.passwordResetOtpExpire = new Date(Date.now() + 10 * 60 * 1000)
    user.passwordResetOtpAttempts = 0

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000)
    const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:8443'
    const resetUrl = `${clientOrigin.replace(/\/+$/, '')}/reset-password/${resetToken}`
    await user.save()

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Cyber Fresh — Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Cyber Fresh account.</p>
        <p>Your six-digit password reset code is: <strong>${otp}</strong></p>
        <p>This code expires in 10 minutes.</p>
        <p>Or click this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
      `,
    })

    if (!emailResult.sent) {
      console.error(`[Password Reset] No reset delivery succeeded for ${user.email}.`)
    }

    res.json({ message: 'If an account exists for that email, reset instructions will be sent.' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/reset-password/:token — Requirement 10
export async function resetPassword(req, res) {
  try {
    const { token } = req.params
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ message: 'New password is required' })
    }

    const strength = validatePasswordStrength(password)
    if (!strength.isValid) {
      return res.status(400).json({ message: strength.message })
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    user.passwordResetOtpHash = undefined
    user.passwordResetOtpExpire = undefined
    user.passwordResetOtpAttempts = 0
    await user.save()

    await createNotification({
      userId: user._id,
      type: 'account',
      title: 'Password Changed 🔐',
      message: 'Your account password was successfully reset.',
    })
    await sendUserMessage(
      user,
      'CyberFresh: Your password was reset. Contact support immediately if you did not make this change.',
    )

    res.json({ message: 'Password reset successful. You may now log in with your new password.' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/reset-password-otp
export async function resetPasswordWithOtp(req, res) {
    try {
      const { email, otp, password } = req.body
      if (!email || !otp || !password) {
        return res.status(400).json({ message: 'Email, one-time code, and new password are required.' })
      }
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: 'Enter the six-digit one-time code.' })
      }
      const strength = validatePasswordStrength(password)
      if (!strength.isValid) {
        return res.status(400).json({ message: strength.message })
      }

      const user = await User.findOne({
        email: email.trim().toLowerCase(),
        passwordResetOtpExpire: { $gt: Date.now() },
      }).select('+passwordResetOtpHash +passwordResetOtpAttempts')
      if (!user || !user.passwordResetOtpHash || user.passwordResetOtpAttempts >= 5) {
        return res.status(400).json({ message: 'Invalid or expired password reset code.' })
      }
      if (!(await bcrypt.compare(otp, user.passwordResetOtpHash))) {
        user.passwordResetOtpAttempts += 1
        await user.save()
        return res.status(400).json({ message: 'Invalid or expired password reset code.' })
      }

      user.password = password
      user.passwordResetOtpHash = undefined
      user.passwordResetOtpExpire = undefined
      user.passwordResetOtpAttempts = 0
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save()
      await createNotification({
        userId: user._id,
        type: 'account',
        title: 'Password Changed',
        message: 'Your account password was successfully reset.',
      })
      await sendUserMessage(
        user,
        'CyberFresh: Your password was reset. Contact support immediately if you did not make this change.',
      )

      res.json({ message: 'Password reset successful. You may now log in with your new password.' })
    } catch (err) {
      console.error('OTP password reset error:', err)
      res.status(500).json({ message: err.message })
  }
}

// PATCH /api/auth/change-password — Authenticated user password change
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    const strength = validatePasswordStrength(newPassword)
    if (!strength.isValid) {
      return res.status(400).json({ message: strength.message })
    }

    user.password = newPassword
    await user.save()

    await createNotification({
      userId: user._id,
      type: 'account',
      title: 'Password Updated 🔐',
      message: 'Your account password has been changed successfully.',
    })
    await sendUserMessage(
      user,
      'CyberFresh: Your password was changed. Contact support immediately if you did not make this change.',
    )

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ message: err.message })
  }
}

// PATCH /api/auth/profile — Update user profile (Requirement 11: DO NOT allow changing role)
export async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Whitelist allowed fields to update — NEVER update role!
    const allowed = [
      'name', 'phone', 'address', 'city', 'state', 'pincode',
      'avatar', 'businessName', 'ownerName', 'category', 'description', 'ngoName',
    ]

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        user[key] = req.body[key]
      }
    }

    if (req.body.communicationSettings !== undefined) {
      const communicationSettings = req.body.communicationSettings
      const allowedSettings = ['emailNotifications']
      if (
        !communicationSettings ||
        typeof communicationSettings !== 'object' ||
        Array.isArray(communicationSettings) ||
        Object.entries(communicationSettings).some(([key, value]) =>
          !allowedSettings.includes(key) || typeof value !== 'boolean',
        )
      ) {
        return res.status(400).json({ message: 'Notification preferences must contain supported boolean values.' })
      }
      user.communicationSettings = {
        emailNotifications: user.communicationSettings.emailNotifications,
        ...communicationSettings,
      }
    }

    await user.save()
    res.json({ user: sanitize(user), message: 'Profile updated successfully' })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ message: err.message })
  }
}

// PATCH /api/auth/vendor-payment-details
export async function updateVendorPaymentDetails(req, res) {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can update vendor payment details.' })
    }
    const upiId = typeof req.body.upiId === 'string' ? req.body.upiId.trim() : ''
    if (!/^[\w.-]{2,256}@[A-Za-z0-9.-]{2,64}$/.test(upiId)) {
      return res.status(400).json({ message: 'Enter a valid UPI ID, such as name@bank.' })
    }

    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.paymentDetails = {
      ...user.paymentDetails?.toObject?.(),
      upiId,
    }
    await user.save()
    res.json({ user: sanitize(user), message: 'Vendor payment details saved.' })
  } catch (err) {
    console.error('Update vendor payment details error:', err)
    res.status(500).json({ message: err.message || 'Could not save vendor payment details.' })
  }
}

// PATCH /api/auth/theme — Requirement 22
export async function updateTheme(req, res) {
  try {
    const { mode, accent } = req.body
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (mode && ['light', 'dark', 'system'].includes(mode)) {
      user.theme.mode = mode
    }
    if (accent && ['blue', 'green', 'purple', 'orange', 'rose'].includes(accent)) {
      user.theme.accent = accent
    }

    await user.save()
    res.json({ theme: user.theme })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
