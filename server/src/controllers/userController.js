import User from '../models/User.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -verificationToken -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, avatar, team } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (team) user.team = team;
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, coins: user.coins, team: user.team, avatar: user.avatar } });
  } catch (error) {
    next(error);
  }
};
