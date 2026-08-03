import Leaderboard from '../models/Leaderboard.js';

export const listLeaderboards = async (req, res, next) => {
  try {
    const period = req.query.period || 'weekly';
    const records = await Leaderboard.find({ period }).populate('team topSupporter').sort({ teamSupportScore: -1 });
    res.json({ period, records });
  } catch (error) {
    next(error);
  }
};
