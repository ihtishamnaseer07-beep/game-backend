import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import { generateAuthToken, generateVerificationToken, generateResetToken } from '../utils/tokenService.js';

const PHONE_REGEX = /^(\+92[3]\d{9}|\+9665\d{8})$/;

function normalizePhone(value = '') {
  return String(value).replace(/\s+/g, '');
}

function isInternationalPhone(value = '') {
  return PHONE_REGEX.test(normalizePhone(value));
}

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: 'Email already registered.' });

    const existingPhoneUser = await User.findOne({ phone: normalizedPhone });
    if (existingPhoneUser) return res.status(409).json({ message: 'Mobile number already registered.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = generateVerificationToken();

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      verificationToken,
      isEmailVerified: false,
    });

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your email for AI Cartoon Battle Arena',
      html: `<p>Hi ${user.name},</p><p>Click below to verify your email:</p><p><a href="${verificationUrl}">Verify email</a></p>`,
    });

    const token = generateAuthToken({ id: user._id, role: user.role });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        currency: user.currency,
        coins: user.coins,
        team: user.team,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const rawIdentifier = String(identifier || email || phone || '').trim();
    const normalizedEmail = rawIdentifier.toLowerCase();
    const normalizedPhone = normalizePhone(rawIdentifier);

    let user = null;
    if (isInternationalPhone(normalizedPhone)) {
      user = await User.findOne({ phone: normalizedPhone });
    } else {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    if (user.isBanned) return res.status(403).json({ message: 'Your account has been banned.' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = generateAuthToken({ id: user._id, role: user.role });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        currency: user.currency,
        coins: user.coins,
        team: user.team,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid verification token.' });

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset your AI Cartoon Battle Arena password',
      html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password:</p><p><a href="${resetUrl}">Reset password</a></p>`,
    });

    res.json({ message: 'Password reset email sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token.' });

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    next(error);
  }
};
