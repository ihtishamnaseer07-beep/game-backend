import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import { generateAuthToken, generateVerificationToken, generateResetToken } from '../utils/tokenService.js';
import { ensureUserReferralCode, generateUniqueReferralCode } from '../utils/referralCode.js';
import { serializeUser } from '../utils/userResponse.js';

const PHONE_REGEX = /^(\+92[3]\d{9}|\+9665\d{8})$/;
const REFERRAL_SIGNUP_BONUS = 200;

function normalizePhone(value = '') {
  return String(value).replace(/\s+/g, '');
}

function isInternationalPhone(value = '') {
  return PHONE_REGEX.test(normalizePhone(value));
}

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, referral, referralCode } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);
    const normalizedReferralCode = String(referralCode || referral || '').trim().toUpperCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: 'Email already registered.' });

    const existingPhoneUser = await User.findOne({ phone: normalizedPhone });
    if (existingPhoneUser) return res.status(409).json({ message: 'Mobile number already registered.' });

    let referrer = null;
    if (normalizedReferralCode) {
      referrer = await User.findOne({ referralCode: normalizedReferralCode });
      if (!referrer) {
        return res.status(400).json({ message: 'Referral code is invalid.' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = generateVerificationToken();
    const generatedReferralCode = await generateUniqueReferralCode(name);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      verificationToken,
      isEmailVerified: false,
      referralCode: generatedReferralCode,
      referredBy: referrer?._id || null,
    });

    if (referrer) {
      referrer.coins = Number(referrer.coins || 0) + REFERRAL_SIGNUP_BONUS;
      referrer.invitedCount = Number(referrer.invitedCount || 0) + 1;
      referrer.referralCoinsEarned = Number(referrer.referralCoinsEarned || 0) + REFERRAL_SIGNUP_BONUS;
      await referrer.save();
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your email for AI Cartoon Battle Arena',
      html: `<p>Hi ${user.name},</p><p>Click below to verify your email:</p><p><a href="${verificationUrl}">Verify email</a></p>`,
    });

    const token = generateAuthToken({ id: user._id, role: user.role });
    res.status(201).json({
      token,
      user: serializeUser(user),
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

    await ensureUserReferralCode(user);

    const token = generateAuthToken({ id: user._id, role: user.role });
    res.json({
      token,
      user: serializeUser(user),
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
