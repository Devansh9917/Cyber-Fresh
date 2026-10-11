import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vendorName: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { _id: false }
)

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    distanceKm: { type: Number, min: 0, default: 0 },
    earnings: { type: Number, min: 0, default: 0 },
    earningsStatus: {
      type: String,
      enum: ['NotEarned', 'Payable', 'Paid'],
      default: 'NotEarned',
    },
    paidAt: { type: Date },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    payoutReference: { type: String, trim: true, maxlength: 100, default: '' },
    assignedAt: { type: Date },
  },
  { _id: false }
)

const deliveryLocationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // e.g. CF-2026-4521
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    address: { type: String, default: '' },
    deliveryLocation: { type: deliveryLocationSchema, default: null },
    deliveryDistanceKm: { type: Number, min: 0, default: 0 },
    deliveryFee: { type: Number, min: 0, default: 40 },
    deliveryPartner: { type: deliveryPartnerSchema, default: () => ({}) },
    deliveryVerificationCode: { type: String, select: false, default: '' },
    deliveryVerificationAttempts: { type: Number, default: 0, min: 0 },
    deliveryVerifiedAt: { type: Date },
    paymentMethod: { type: String, enum: ['razorpay', 'upi', 'card', 'cod'], default: 'cod' },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    pickupLocation: {
      address: { type: String, trim: true, default: '' },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
    tracking: {
      lastLocation: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
      },
      lastUpdatedAt: { type: Date },
    },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
