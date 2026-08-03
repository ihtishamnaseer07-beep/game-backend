import User from '../models/User.js';
import Team from '../models/Team.js';
import SupportHistory from '../models/SupportHistory.js';
import Leaderboard from '../models/Leaderboard.js';

const updateTeamSupport = async (teamId, coins) => {
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found.');
  team.supportScore += coins;
  await team.save();
  return team;
};

export const claimDailyCoins = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const lastClaimed = user.lastClaimedAt || new Date(0);
    const now = new Date();
    if (now.getDate() === lastClaimed.getDate() && now.getMonth() === lastClaimed.getMonth() && now.getFullYear() === lastClaimed.getFullYear()) {
      return res.status(400).json({ message: 'Daily coins already claimed.' });
    }

    user.coins += 50;
    user.lastClaimedAt = now;
    await user.save();
    res.json({ coins: user.coins, message: 'Daily coins claimed successfully.' });
  } catch (error) {
    next(error);
  }
};

export const supportTeam = async (req, res, next) => {
  try {
    const { teamId, coins } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.coins < coins) return res.status(400).json({ message: 'Not enough coins.' });

    const team = await updateTeamSupport(teamId, coins);
    user.coins -= coins;
    await user.save();

    const history = await SupportHistory.create({ user: user._id, team: team._id, coins });
    await Leaderboard.findOneAndUpdate(
      { team: team._id, period: 'weekly' },
      { $inc: { teamSupportScore: coins }, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    const io = req.app.get('io');
    io.emit('support:update', { teamId: team._id, supportScore: team.supportScore });

    res.json({ message: 'Support sent successfully.', user: { coins: user.coins }, history });
  } catch (error) {
    next(error);
  }
};

export const getSupportHistory = async (req, res, next) => {
  try {
    const history = await SupportHistory.find({ user: req.user._id }).populate('team').sort({ createdAt: -1 });
    res.json({ history });
  } catch (error) {
    next(error);
  }
};
