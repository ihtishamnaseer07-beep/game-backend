import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listCoins,
  getCoin,
  createCoin,
  updateCoin,
  deleteCoin,
  claimDailyBonus,
} from '../controllers/coinController.js';

const router = express.Router();

router.get('/', authenticate, authorize(['admin']), listCoins);
router.get('/me', authenticate, getCoin);
router.post('/daily-bonus', authenticate, claimDailyBonus);
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  [body('user').notEmpty(), body('amount').isInt()],
  validateRequest,
  createCoin
);
router.put('/:id', authenticate, authorize(['admin']), updateCoin);
router.delete('/:id', authenticate, authorize(['admin']), deleteCoin);

export default router;
