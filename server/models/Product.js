import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    freshnessScore: { type: Number, min: 0, max: 100, required: true },
    shelfLife: { type: String },
    expiryCountdown: { type: String },
    expiryDate: { type: String },
    harvestDate: { type: String },

    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorName: { type: String, required: true },

    rating: { type: Number, default: 0 },
    distance: { type: String },
    stockStatus: { type: String, enum: ['In Stock', 'Low Stock', 'Out of Stock'], default: 'In Stock' },
    stock: { type: Number, default: 0 },

    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    deliveryTime: { type: String },
    unit: { type: String, required: true },
    organic: { type: Boolean, default: false },
    tags: [{ type: String }],
    description: { type: String },
    nutritionPer100g: {
      calories: Number, protein: String, carbs: String, fiber: String, vitC: String,
    },
    storageTips: { type: String },
    recipes: [{ type: String }],
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    freshnessSource: { type: String, enum: ['manual', 'ai', 'vendor_override'], default: 'manual' },
    freshnessReason: { type: String, default: '' },
    freshnessLastCheckedAt: { type: Date, default: null },
    donationAlertSentAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// keep stockStatus in sync with stock count
productSchema.pre('save', function (next) {
  if (this.stock <= 0) this.stockStatus = 'Out of Stock'
  else if (this.stock < 15) this.stockStatus = 'Low Stock'
  else this.stockStatus = 'In Stock'
  next()
})

export default mongoose.model('Product', productSchema)
