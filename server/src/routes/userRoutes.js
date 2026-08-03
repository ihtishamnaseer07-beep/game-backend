import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', authenticate, getUserProfile);
router.put('/me', authenticate, updateUserProfile);

export default router;
