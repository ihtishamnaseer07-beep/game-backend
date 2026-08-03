import mongoose from 'mongoose';

const paymentGatewaySchema = new mongoose.Schema({
  provider: { type: String, enum: ['JazzCash', 'EasyPaisa', 'Manual'], required: true },
  currency: { type: String, default: 'PKR' },
  isActive: { type: Boolean, default: true },
  config: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

const PaymentGateway = mongoose.model('PaymentGateway', paymentGatewaySchema);
export default PaymentGateway;
