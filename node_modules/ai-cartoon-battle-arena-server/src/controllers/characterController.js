import Character from '../models/Character.js';

export const listCharacters = async (req, res, next) => {
  try {
    const characters = await Character.find().sort({ name: 1 });
    res.json({ characters });
  } catch (error) {
    next(error);
  }
};

export const getCharacter = async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) return res.status(404).json({ message: 'Character not found.' });
    res.json({ character });
  } catch (error) {
    next(error);
  }
};

export const createCharacter = async (req, res, next) => {
  try {
    const character = await Character.create(req.body);
    res.status(201).json({ character });
  } catch (error) {
    next(error);
  }
};

export const updateCharacter = async (req, res, next) => {
  try {
    const character = await Character.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!character) return res.status(404).json({ message: 'Character not found.' });
    res.json({ character });
  } catch (error) {
    next(error);
  }
};

export const deleteCharacter = async (req, res, next) => {
  try {
    const character = await Character.findByIdAndDelete(req.params.id);
    if (!character) return res.status(404).json({ message: 'Character not found.' });
    res.json({ message: 'Character deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
