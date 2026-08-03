import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').matches(/^\+92\s?3\d{2}\s?\d{7}$/).withMessage('Invalid Pakistani phone number'),
    body('password').isLength({ min: 8 }),
  ],
  validateRequest,
  registerUser
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validateRequest,
  loginUser
);

router.get('/verify-email', verifyEmail);

router.post(
  '/forgot-password',
  [body('email').isEmail()],
  validateRequest,
  forgotPassword
);

router.post(
  '/reset-password',
  [body('token').notEmpty(), body('password').isLength({ min: 8 })],
  validateRequest,
  resetPassword
);

export default router;
