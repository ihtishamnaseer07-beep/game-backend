import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listCoinPackages,
  createCoinPackage,
  updateCoinPackage,
  deleteCoinPackage,
} from '../controllers/coinPackageController.js';

const router = express.Router();

router.get('/', listCoinPackages);
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  [body('title').notEmpty(), body('coins').isInt({ min: 1 }), body('pricePKR').isInt({ min: 1 })],
  validateRequest,
  createCoinPackage
);
router.put('/:id', authenticate, authorize(['admin']), updateCoinPackage);
router.delete('/:id', authenticate, authorize(['admin']), deleteCoinPackage);

export default router;
