import User from '../models/User.js';
import { ensureUserReferralCode } from '../utils/referralCode.js';
import { serializeUser } from '../utils/userResponse.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -verificationToken -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await ensureUserReferralCode(user);
    res.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, avatar, team, preferredPaymentMethod } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (team) user.team = team;
    if (typeof preferredPaymentMethod === 'string') user.preferredPaymentMethod = preferredPaymentMethod;
    await ensureUserReferralCode(user);
    await user.save();
    res.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};
