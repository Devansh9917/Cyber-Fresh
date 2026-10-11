import mongoose from 'mongoose'

const supportTicketSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Complaint', 'Feedback'], required: true },
    category: {
      type: String,
      enum: ['Order', 'Product', 'Payment', 'Delivery', 'Account', 'App', 'Other'],
      required: true,
    },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    orderId: { type: String, trim: true, maxlength: 100, default: '' },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reporterName: { type: String, required: true, trim: true },
    reporterEmail: { type: String, required: true, lowercase: true, trim: true },
    reporterRole: {
      type: String,
      enum: ['customer', 'vendor', 'ngo', 'delivery_partner'],
      required: true,
    },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
    adminNote: { type: String, trim: true, maxlength: 1000, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

supportTicketSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('SupportTicket', supportTicketSchema)
