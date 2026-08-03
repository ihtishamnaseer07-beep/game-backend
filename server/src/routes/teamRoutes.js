import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { listTeams, getTeam, createTeam, updateTeam, deleteTeam } from '../controllers/teamController.js';

const router = express.Router();

router.get('/', listTeams);
router.get('/:id', getTeam);
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  [body('name').notEmpty(), body('slug').notEmpty()],
  validateRequest,
  createTeam
);
router.put('/:id', authenticate, authorize(['admin']), updateTeam);
router.delete('/:id', authenticate, authorize(['admin']), deleteTeam);

export default router;
