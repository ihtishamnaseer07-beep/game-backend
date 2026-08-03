import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  getAdminStats,
  updateUserRole,
  getAllUsers,
  deleteUser,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate, authorize(['admin']));
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
