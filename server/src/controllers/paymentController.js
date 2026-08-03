import PaymentGateway from '../models/PaymentGateway.js';

export const listPaymentGateways = async (req, res, next) => {
  try {
    const gateways = await PaymentGateway.find().sort({ createdAt: -1 });
    res.json({ gateways });
  } catch (error) {
    next(error);
  }
};

export const createPaymentGateway = async (req, res, next) => {
  try {
    const gateway = await PaymentGateway.create(req.body);
    res.status(201).json({ gateway });
  } catch (error) {
    next(error);
  }
};

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { provider, amount, currency = 'PKR' } = req.body;
    const gateway = await PaymentGateway.findOne({ provider, isActive: true });

    if (!gateway) {
      return res.status(404).json({ message: 'Requested provider is not configured yet.' });
    }

    res.json({
      success: true,
      provider,
      amount,
      currency,
      message: 'Payment intent created for future gateway integration.',
      gatewayId: gateway._id,
    });
  } catch (error) {
    next(error);
  }
};
