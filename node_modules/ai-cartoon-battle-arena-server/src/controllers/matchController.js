import Match from '../models/Match.js';
import Team from '../models/Team.js';
import {
  startMatchEngine,
  pauseMatchEngine,
  resumeMatchEngine,
  endMatchEngine,
} from '../services/matchEngine.js';

export const listMatches = async (req, res, next) => {
  try {
    const matches = await Match.find().populate('teamA teamB').sort({ createdAt: -1 });
    res.json({ matches });
  } catch (error) {
    next(error);
  }
};

export const getMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id).populate('teamA teamB');
    if (!match) return res.status(404).json({ message: 'Match not found.' });
    res.json({ match });
  } catch (error) {
    next(error);
  }
};

export const createMatch = async (req, res, next) => {
  try {
    const { teamA, teamB, title } = req.body;
    const match = await Match.create({ teamA, teamB, title, status: 'pending', scoreA: 0, scoreB: 0 });
    res.status(201).json({ match });
  } catch (error) {
    next(error);
  }
};

export const updateMatch = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!match) return res.status(404).json({ message: 'Match not found.' });
    res.json({ match });
  } catch (error) {
    next(error);
  }
};

export const deleteMatch = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found.' });
    res.json({ message: 'Match deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const startMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found.' });
    match.status = 'live';
    match.startedAt = new Date();
    await match.save();
    await startMatchEngine(match._id);
    res.json({ match });
  } catch (error) {
    next(error);
  }
};

export const pauseMatch = async (req, res, next) => {
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

export const resumeMatch = async (req, res, next) => {
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

export const endMatch = async (req, res, next) => {
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
