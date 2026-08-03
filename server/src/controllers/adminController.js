import User from '../models/User.js';
import Team from '../models/Team.js';
import Match from '../models/Match.js';
import SupportHistory from '../models/SupportHistory.js';
import Leaderboard from '../models/Leaderboard.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    const totalMatches = await Match.countDocuments();
    const totalCoins = await User.aggregate([{ $group: { _id: null, total: { $sum: '$coins' } } }]);
    const supportCount = await SupportHistory.countDocuments();
    const topTeams = await Team.find().sort({ supportScore: -1 }).limit(5);

    res.json({ totalUsers, activeUsers, totalMatches, totalCoins: totalCoins[0]?.total || 0, supportCount, topTeams });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash -verificationToken -resetPasswordToken -resetPasswordExpires');
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const role = req.body.role;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role.' });
    user.role = role;
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
