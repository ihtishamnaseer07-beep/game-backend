import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Match from '../models/Match.js';
import CoinPackage from '../models/CoinPackage.js';
import { calculateProbability, startMatchEngine, pauseMatchEngine, resumeMatchEngine, endMatchEngine } from '../services/matchEngine.js';

export const seedSuperAdmin = async () => {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME?.trim() || 'Super Admin';
  const phone = process.env.SUPER_ADMIN_PHONE?.trim() || '';

  if (!email || !password) {
    console.warn('Super admin seed skipped. Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD to enable it.');
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) return;
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: 'superadmin',
    coins: 0,
    isEmailVerified: true,
  });
};

export const listAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash -verificationToken -resetPasswordToken -resetPasswordExpires');
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const updateUserCoins = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.coins = Math.max(0, (user.coins || 0) + Number(amount));
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const listMatchesForAdmin = async (req, res, next) => {
  try {
    const matches = await Match.find().populate('teamA teamB').sort({ createdAt: -1 });
    res.json({ matches });
  } catch (error) {
    next(error);
  }
};

export const updateMatchScore = async (req, res, next) => {
  try {
    const { scoreA, scoreB } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found.' });
    match.scoreA = Number(scoreA ?? match.scoreA);
    match.scoreB = Number(scoreB ?? match.scoreB);
    match.winnerProbability = calculateProbability(match.scoreA, match.scoreB);
    await match.save();
    res.json({ match });
  } catch (error) {
    next(error);
  }
};

export const listTeamsForAdmin = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json({ teams });
  } catch (error) {
    next(error);
  }
};

export const updateTeamDetails = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!team) return res.status(404).json({ message: 'Team not found.' });
    res.json({ team });
  } catch (error) {
    next(error);
  }
};

export const listCoinPackagesForAdmin = async (req, res, next) => {
  try {
    const packages = await CoinPackage.find().sort({ pricePKR: 1 });
    res.json({ packages });
  } catch (error) {
    next(error);
  }
};

export const updateCoinPackageForAdmin = async (req, res, next) => {
  try {
    const coinPackage = await CoinPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coinPackage) return res.status(404).json({ message: 'Coin package not found.' });
    res.json({ coinPackage });
  } catch (error) {
    next(error);
  }
};

export const createMatchForAdmin = async (req, res, next) => {
  try {
    const { title, teamA, teamB } = req.body;
    const match = await Match.create({ title, teamA, teamB, status: 'pending', scoreA: 0, scoreB: 0 });
    res.status(201).json({ match });
  } catch (error) {
    next(error);
  }
};

export const startAdminMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found.' });
    match.status = 'live';
    await match.save();
    await startMatchEngine(match._id);
    res.json({ match });
  } catch (error) {
    next(error);
  }
};

export const pauseAdminMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found.' });
    match.status = 'paused';
    await match.save();
    await pauseMatchEngine();
    res.json({ match });
  } catch (error) {
    next(error);
  }
};

export const resumeAdminMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found.' });
    match.status = 'live';
    await match.save();
    await resumeMatchEngine(match._id);
    res.json({ match });
  } catch (error) {
    next(error);
  }
};

export const endAdminMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found.' });
    match.status = 'finished';
    match.endedAt = new Date();
    await match.save();
    await endMatchEngine();
    res.json({ match });
  } catch (error) {
    next(error);
  }
};
