import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listAdminUsers,
  updateUserCoins,
  toggleUserBan,
  listMatchesForAdmin,
  updateMatchScore,
  listTeamsForAdmin,
  updateTeamDetails,
  listCoinPackagesForAdmin,
  updateCoinPackageForAdmin,
  createMatchForAdmin,
  startAdminMatch,
  pauseAdminMatch,
  resumeAdminMatch,
  endAdminMatch,
} from '../controllers/adminPanelController.js';

const router = express.Router();

router.use(authenticate, authorize(['admin']));

router.get('/users', listAdminUsers);
router.put('/users/:id/coins', [body('amount').isInt()], validateRequest, updateUserCoins);
router.post('/users/:id/ban', toggleUserBan);

router.get('/matches', listMatchesForAdmin);
router.post('/matches', [body('title').notEmpty(), body('teamA').notEmpty(), body('teamB').notEmpty()], validateRequest, createMatchForAdmin);
router.put('/matches/:id/score', [body('scoreA').optional().isInt(), body('scoreB').optional().isInt()], validateRequest, updateMatchScore);
router.post('/matches/:id/start', startAdminMatch);
router.post('/matches/:id/pause', pauseAdminMatch);
router.post('/matches/:id/resume', resumeAdminMatch);
router.post('/matches/:id/end', endAdminMatch);

router.get('/teams', listTeamsForAdmin);
router.put('/teams/:id', updateTeamDetails);

router.get('/coin-packages', listCoinPackagesForAdmin);
router.put('/coin-packages/:id', updateCoinPackageForAdmin);

export default router;
