import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { supportTeam, getSupportHistory, claimDailyCoins } from '../controllers/supportController.js';

const router = express.Router();

router.post('/claim', authenticate, claimDailyCoins);
router.post('/team', authenticate, [body('teamId').notEmpty(), body('coins').isInt({ min: 1 })], validateRequest, supportTeam);
router.get('/history', authenticate, getSupportHistory);

export default router;
