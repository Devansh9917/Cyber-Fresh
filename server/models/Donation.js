import mongoose from 'mongoose'

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'],
      default: 'PENDING',
    },
    assignedAt: { type: Date },
  },
  { _id: false }
)

const donationSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    product: { type: String, default: '' },
    quantity: { type: String, default: '' },
    freshnessScore: { type: Number, default: 0 },
    expiryDate: { type: String, default: '' },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ngoName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending Pickup', 'Accepted', 'Delivered', 'Completed'],
      default: 'Pending Pickup',
    },
    deliveryPartner: { type: deliveryPartnerSchema, default: () => ({}) },
    deliveryVerificationCode: { type: String, select: false, default: '' },
    deliveryVerificationAttempts: { type: Number, default: 0, min: 0 },
    deliveryVerifiedAt: { type: Date },
    distance: { type: String, default: 'Nearby' },
    mealsSaved: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'N/A'],
      default: 'N/A',
    },
    transactionId: { type: String, default: '' },
    purpose: { type: String, default: 'Food Rescue & Relief' },
  },
  { timestamps: true }
)

export default mongoose.model('Donation', donationSchema)
