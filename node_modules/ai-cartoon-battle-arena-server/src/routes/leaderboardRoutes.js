import express from 'express';
import { listLeaderboards } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/', listLeaderboards);

export default router;
