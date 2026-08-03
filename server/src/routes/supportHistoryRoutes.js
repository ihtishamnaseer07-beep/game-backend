import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  listSupportHistory,
  getSupportHistoryById,
  deleteSupportHistory,
} from '../controllers/supportHistoryController.js';

const router = express.Router();

router.get('/', authenticate, authorize(['admin']), listSupportHistory);
router.get('/:id', authenticate, authorize(['admin']), getSupportHistoryById);
router.delete('/:id', authenticate, authorize(['admin']), deleteSupportHistory);

export default router;
