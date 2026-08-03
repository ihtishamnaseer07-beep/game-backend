import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

export const generateAuthToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const generateVerificationToken = () => randomUUID();

export const generateResetToken = () => randomUUID();
