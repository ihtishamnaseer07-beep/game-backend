import Coin from '../models/Coin.js';
import User from '../models/User.js';

const DAILY_BONUS_AMOUNT = 50;
const SPIN_REWARDS = [25, 40, 60, 100, 150, 250];
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function buildCooldown(lastClaimAt) {
  if (!lastClaimAt) {
    return { available: true, nextAvailableAt: null, remainingMs: 0 };
  }

  const now = Date.now();
  const target = new Date(lastClaimAt).getTime() + DAILY_COOLDOWN_MS;
  const remainingMs = Math.max(0, target - now);

  return {
    available: remainingMs === 0,
    nextAvailableAt: remainingMs === 0 ? null : new Date(target),
    remainingMs,
  };
}

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
    const cooldown = buildCooldown(user.lastLoginBonus);

    if (!cooldown.available) {
      return res.status(400).json({
        message: 'Daily bonus already claimed. Try again later.',
        nextClaimAt: cooldown.nextAvailableAt,
        remainingMs: cooldown.remainingMs,
      });
    }

    user.coins += DAILY_BONUS_AMOUNT;
    user.lastLoginBonus = now;
    await user.save();

    res.json({
      message: 'Daily bonus claimed successfully.',
      reward: DAILY_BONUS_AMOUNT,
      coins: user.coins,
      lastLoginBonus: user.lastLoginBonus,
    });
  } catch (error) {
    next(error);
  }
};

export const spinLuckyWheel = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const cooldown = buildCooldown(user.lastSpinAt);
    if (!cooldown.available) {
      return res.status(400).json({
        message: 'Lucky spin already used. Try again later.',
        nextSpinAt: cooldown.nextAvailableAt,
        remainingMs: cooldown.remainingMs,
      });
    }

    const reward = SPIN_REWARDS[Math.floor(Math.random() * SPIN_REWARDS.length)];
    user.coins += reward;
    user.lastSpinAt = new Date();
    await user.save();

    res.json({
      message: 'Lucky spin reward credited successfully.',
      reward,
      coins: user.coins,
      lastSpinAt: user.lastSpinAt,
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyRewardsStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('coins lastLoginBonus lastSpinAt');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const bonus = buildCooldown(user.lastLoginBonus);
    const spin = buildCooldown(user.lastSpinAt);

    res.json({
      coins: user.coins,
      dailyBonus: {
        amount: DAILY_BONUS_AMOUNT,
        lastClaimAt: user.lastLoginBonus || null,
        ...bonus,
      },
      luckySpin: {
        rewards: SPIN_REWARDS,
        lastSpinAt: user.lastSpinAt || null,
        ...spin,
      },
    });
  } catch (error) {
    next(error);
  }
};
