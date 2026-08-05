import PaymentGateway from '../models/PaymentGateway.js';
import PaymentRequest from '../models/PaymentRequest.js';
import User from '../models/User.js';

function serializePaymentRequest(request) {
  const user = request.user || {};
  const reviewer = request.reviewedBy || {};

  return {
    id: String(request._id),
    userId: String(user._id || request.user || ''),
    userName: user.name || '',
    phone: user.phone || '',
    email: user.email || '',
    type: request.type,
    amount: Number(request.amount || 0),
    gateway: request.gateway,
    transactionId: request.transactionId || '',
    accountTitle: request.accountTitle || '',
    accountNumber: request.accountNumber || '',
    accountDetails: request.accountDetails || '',
    receiptName: request.receiptName || '',
    receiptData: request.receiptData || '',
    status: request.status,
    reviewReason: request.reviewReason || '',
    reviewedAt: request.reviewedAt || null,
    reviewedBy: reviewer.name ? { id: String(reviewer._id), name: reviewer.name } : null,
    createdAt: request.createdAt,
  };
}

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

export const createDepositRequest = async (req, res, next) => {
  try {
    const { amount, gateway, transactionId, accountTitle, accountNumber, receiptName = '', receiptData = '' } = req.body;
    const user = await User.findById(req.user._id).select('name phone email');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (Number(amount) < 100) return res.status(400).json({ message: 'Minimum deposit amount is Rs 100.' });
    if (!String(transactionId || '').trim()) return res.status(400).json({ message: 'Transaction ID is required.' });

    const request = await PaymentRequest.create({
      user: user._id,
      type: 'deposit',
      amount: Number(amount),
      gateway: String(gateway || 'EasyPaisa').trim(),
      transactionId: String(transactionId || '').trim(),
      accountTitle: String(accountTitle || '').trim(),
      accountNumber: String(accountNumber || '').trim(),
      receiptName: String(receiptName || '').trim(),
      receiptData: String(receiptData || ''),
    });

    const hydrated = await PaymentRequest.findById(request._id).populate('user', 'name phone email');
    res.status(201).json({ request: serializePaymentRequest(hydrated) });
  } catch (error) {
    next(error);
  }
};

export const createWithdrawalRequest = async (req, res, next) => {
  try {
    const { amount, gateway, accountTitle, accountNumber } = req.body;
    const user = await User.findById(req.user._id).select('name phone email coins');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const numericAmount = Number(amount);
    if (numericAmount < 500) return res.status(400).json({ message: 'Minimum withdrawal amount is Rs 500.' });
    if (numericAmount > Number(user.coins || 0)) {
      return res.status(400).json({ message: 'Insufficient balance for this withdrawal request.' });
    }

    const request = await PaymentRequest.create({
      user: user._id,
      type: 'withdrawal',
      amount: numericAmount,
      gateway: String(gateway || 'EasyPaisa').trim(),
      accountTitle: String(accountTitle || '').trim(),
      accountNumber: String(accountNumber || '').trim(),
      accountDetails: `${String(gateway || 'EasyPaisa').trim()} • ${String(accountNumber || '').trim()}`,
    });

    const hydrated = await PaymentRequest.findById(request._id).populate('user', 'name phone email');
    res.status(201).json({ request: serializePaymentRequest(hydrated) });
  } catch (error) {
    next(error);
  }
};

export const listMyPaymentRequests = async (req, res, next) => {
  try {
    const requests = await PaymentRequest.find({ user: req.user._id })
      .populate('user', 'name phone email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ requests: requests.map(serializePaymentRequest) });
  } catch (error) {
    next(error);
  }
};

export const listPaymentRequestsForAdmin = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const requests = await PaymentRequest.find(filter)
      .populate('user', 'name phone email coins')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ requests: requests.map(serializePaymentRequest) });
  } catch (error) {
    next(error);
  }
};

export const approvePaymentRequest = async (req, res, next) => {
  try {
    const request = await PaymentRequest.findById(req.params.id).populate('user');
    if (!request) return res.status(404).json({ message: 'Payment request not found.' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be approved.' });

    const user = await User.findById(request.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (request.type === 'deposit') {
      user.coins = Number(user.coins || 0) + Number(request.amount || 0);
    } else {
      if (Number(user.coins || 0) < Number(request.amount || 0)) {
        return res.status(400).json({ message: 'User balance is no longer sufficient for this withdrawal.' });
      }
      user.coins = Math.max(0, Number(user.coins || 0) - Number(request.amount || 0));
    }

    request.status = 'approved';
    request.reviewReason = '';
    request.reviewedAt = new Date();
    request.reviewedBy = req.user._id;

    await user.save();
    await request.save();

    const hydrated = await PaymentRequest.findById(request._id)
      .populate('user', 'name phone email')
      .populate('reviewedBy', 'name');

    res.json({ request: serializePaymentRequest(hydrated), userBalance: user.coins });
  } catch (error) {
    next(error);
  }
};

export const rejectPaymentRequest = async (req, res, next) => {
  try {
    const request = await PaymentRequest.findById(req.params.id).populate('user', 'name phone email');
    if (!request) return res.status(404).json({ message: 'Payment request not found.' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be rejected.' });

    request.status = 'rejected';
    request.reviewReason = String(req.body?.reason || '').trim();
    request.reviewedAt = new Date();
    request.reviewedBy = req.user._id;
    await request.save();

    const hydrated = await PaymentRequest.findById(request._id)
      .populate('user', 'name phone email')
      .populate('reviewedBy', 'name');

    res.json({ request: serializePaymentRequest(hydrated) });
  } catch (error) {
    next(error);
  }
};
