import CoinPackage from '../models/CoinPackage.js';

export const listCoinPackages = async (req, res, next) => {
  try {
    const packages = await CoinPackage.find().sort({ pricePKR: 1 });
    res.json({ packages });
  } catch (error) {
    next(error);
  }
};

export const createCoinPackage = async (req, res, next) => {
  try {
    const coinPackage = await CoinPackage.create(req.body);
    res.status(201).json({ coinPackage });
  } catch (error) {
    next(error);
  }
};

export const updateCoinPackage = async (req, res, next) => {
  try {
    const coinPackage = await CoinPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coinPackage) return res.status(404).json({ message: 'Coin package not found.' });
    res.json({ coinPackage });
  } catch (error) {
    next(error);
  }
};

export const deleteCoinPackage = async (req, res, next) => {
  try {
    const coinPackage = await CoinPackage.findByIdAndDelete(req.params.id);
    if (!coinPackage) return res.status(404).json({ message: 'Coin package not found.' });
    res.json({ message: 'Coin package deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
