import SupportHistory from '../models/SupportHistory.js';

export const listSupportHistory = async (req, res, next) => {
  try {
    const history = await SupportHistory.find().populate('user team').sort({ createdAt: -1 });
    res.json({ history });
  } catch (error) {
    next(error);
  }
};

export const getSupportHistoryById = async (req, res, next) => {
  try {
    const history = await SupportHistory.findById(req.params.id).populate('user team');
    if (!history) return res.status(404).json({ message: 'Support history entry not found.' });
    res.json({ history });
  } catch (error) {
    next(error);
  }
};

export const deleteSupportHistory = async (req, res, next) => {
  try {
    const history = await SupportHistory.findByIdAndDelete(req.params.id);
    if (!history) return res.status(404).json({ message: 'Support history entry not found.' });
    res.json({ message: 'Support history entry deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
