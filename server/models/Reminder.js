import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    status: { type: String, enum: ['Waiting', 'Back In Stock', 'Notification Sent'], default: 'Waiting' },
  },
  { timestamps: true }
)

export default mongoose.model('Reminder', reminderSchema)
