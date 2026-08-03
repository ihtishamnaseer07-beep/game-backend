import Coin from '../models/Coin.js';
import User from '../models/User.js';

export const listCoins = async (req, res, next) => {
  try {
    const coins = await Coin.find().populate('user').sort({ createdAt: -1 });
    res.json({ coins });
  } catch (error) {
    next(error);
  }
};

export const getCoin = async (req, res, next) => {
  try {
    const coin = await Coin.findOne({ user: req.user._id });
    if (!coin) return res.status(404).json({ message: 'Coin record not found.' });
    res.json({ coin });
  } catch (error) {
    next(error);
  }
};

export const createCoin = async (req, res, next) => {
  try {
    const coin = await Coin.create(req.body);
    await User.findByIdAndUpdate(req.body.user, { $inc: { coins: req.body.amount } });
    res.status(201).json({ coin });
  } catch (error) {
    next(error);
  }
};

export const updateCoin = async (req, res, next) => {
  try {
    const coin = await Coin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coin) return res.status(404).json({ message: 'Coin record not found.' });
    res.json({ coin });
  } catch (error) {
    next(error);
  }
};

export const deleteCoin = async (req, res, next) => {
  try {
    const coin = await Coin.findByIdAndDelete(req.params.id);
    if (!coin) return res.status(404).json({ message: 'Coin record not found.' });
    res.json({ message: 'Coin record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const claimDailyBonus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const now = new Date();
    const lastClaim = user.lastLoginBonus ? new Date(user.lastLoginBonus) : null;
    const cooldownMs = 24 * 60 * 60 * 1000;

    if (lastClaim && now.getTime() - lastClaim.getTime() < cooldownMs) {
      const nextClaimAt = new Date(lastClaim.getTime() + cooldownMs);
      return res.status(400).json({
        message: 'Daily bonus already claimed. Try again later.',
        nextClaimAt,
      });
    }

    user.coins += 50;
    user.lastLoginBonus = now;
    await user.save();

    res.json({
      message: 'Daily bonus claimed successfully.',
      coins: user.coins,
      lastLoginBonus: user.lastLoginBonus,
    });
  } catch (error) {
    next(error);
  }
};
