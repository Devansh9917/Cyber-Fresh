import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const multiLinkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Website', 'Instagram', 'Facebook', 'LinkedIn', 'X/Twitter', 'YouTube', 'WhatsApp', 'Custom'],
      default: 'Website',
    },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      minlength: 8,
      select: false,
      required: function () {
        return this.authProvider !== 'google'
      },
    },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['customer', 'vendor', 'ngo', 'admin', 'delivery_partner'], required: true },
    deliveryPartnerProfile: {
      approvalStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
      vehicleType: { type: String, trim: true, default: '' },
      vehicleNumber: { type: String, trim: true, default: '' },
      serviceArea: { type: String, trim: true, default: '' },
      profileImage: { type: String, default: '' },
      online: { type: Boolean, default: false },
      availabilityStatus: { type: String, enum: ['AVAILABLE', 'UNAVAILABLE'], default: 'UNAVAILABLE' },
      location: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
      },
      locationUpdatedAt: { type: Date },
      activeOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
      activeDonation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', default: null },
    },

    // Profile photo
    avatar: { type: String, default: '' },

    // OAuth (Google)
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, select: false },

    // Vendor specific
    businessName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
    verified: { type: Boolean, default: false },
    paymentDetails: {
      upiId: { type: String, trim: true, default: '' },
      qrCodeUrl: { type: String, trim: true, default: '' },
    },

    // NGO specific
    ngoName: { type: String, trim: true },

    // Multi-link system
    links: [multiLinkSchema],

    // Theme preference
    theme: {
      mode: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      accent: { type: String, enum: ['blue', 'green', 'purple', 'orange', 'rose'], default: 'green' },
    },

    // Communication settings
    communicationSettings: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      whatsappUpdates: { type: Boolean, default: false },
    },

    // Password reset tokens (hashed)
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    passwordResetOtpHash: { type: String, select: false },
    passwordResetOtpExpire: { type: Date, select: false },
    passwordResetOtpAttempts: { type: Number, default: 0, select: false },

    lastLogin: { type: Date },
    status: { type: String, enum: ['Active', 'Suspended', 'Pending'], default: 'Active' },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false)
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.model('User', userSchema)
