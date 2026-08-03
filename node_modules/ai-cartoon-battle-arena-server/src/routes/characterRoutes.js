import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '../controllers/characterController.js';

const router = express.Router();

router.get('/', listCharacters);
router.get('/:id', getCharacter);
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  [body('name').notEmpty(), body('category').notEmpty()],
  validateRequest,
  createCharacter
);
router.put('/:id', authenticate, authorize(['admin']), updateCharacter);
router.delete('/:id', authenticate, authorize(['admin']), deleteCharacter);

export default router;
