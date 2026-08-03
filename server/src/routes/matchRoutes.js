import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  startMatch,
  pauseMatch,
  resumeMatch,
  endMatch,
} from '../controllers/matchController.js';

const router = express.Router();

router.get('/', listMatches);
router.get('/:id', getMatch);
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  [body('title').notEmpty(), body('teamA').notEmpty(), body('teamB').notEmpty()],
  validateRequest,
  createMatch
);
router.put('/:id', authenticate, authorize(['admin']), updateMatch);
router.delete('/:id', authenticate, authorize(['admin']), deleteMatch);
router.post('/:id/start', authenticate, authorize(['admin']), startMatch);
router.post('/:id/pause', authenticate, authorize(['admin']), pauseMatch);
router.post('/:id/resume', authenticate, authorize(['admin']), resumeMatch);
router.post('/:id/end', authenticate, authorize(['admin']), endMatch);

export default router;
