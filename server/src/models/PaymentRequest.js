import mongoose from 'mongoose';

const paymentRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
  amount: { type: Number, required: true, min: 1 },
  gateway: { type: String, trim: true, required: true },
  transactionId: { type: String, trim: true, default: '' },
  accountTitle: { type: String, trim: true, default: '' },
  accountNumber: { type: String, trim: true, default: '' },
  accountDetails: { type: String, trim: true, default: '' },
  receiptName: { type: String, trim: true, default: '' },
  receiptData: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  reviewReason: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
}, {
  versionKey: false,
});

paymentRequestSchema.index({ user: 1, createdAt: -1 });
paymentRequestSchema.index({ type: 1, status: 1, createdAt: -1 });

const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);
export default PaymentRequest;