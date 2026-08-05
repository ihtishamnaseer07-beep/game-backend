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
    body('phone').custom((value) => {
      const phone = String(value || '').replace(/\s+/g, '');
      if (/^\+9665\d{8}$/.test(phone)) return true;
      if (/^\+923\d{9}$/.test(phone)) return true;
      throw new Error('Invalid phone number. Use +9665XXXXXXXX or +923XXXXXXXXX format.');
    }),
    body('password').isLength({ min: 8 }),
  ],
  validateRequest,
  registerUser
);

router.post(
  '/login',
  [
    body('password').notEmpty(),
    body().custom((_, { req }) => {
      const identifier = String(req.body?.identifier || req.body?.email || req.body?.phone || '').trim();
      const compact = identifier.replace(/\s+/g, '');

      if (!identifier) {
        throw new Error('Email or phone identifier is required.');
      }

      const isPhone = /^\+9665\d{8}$/.test(compact) || /^\+923\d{9}$/.test(compact);
      const isEmail = /.+@.+\..+/.test(identifier);

      if (!isPhone && !isEmail) {
        throw new Error('Provide a valid email or international mobile number.');
      }

      return true;
    }),
  ],
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
