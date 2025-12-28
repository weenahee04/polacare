import { Router } from 'express';
import { body } from 'express-validator';
import {
  requestOTP,
  verifyOTPAndLogin,
  register,
  getProfile,
  updateProfile,
  logout,
  changePassword
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authRateLimiter, otpRateLimiter, sensitiveRateLimiter } from '../middleware/security';

const router = Router();

// ============================================
// Public Auth Endpoints (with rate limiting)
// ============================================

router.post(
  '/otp/request',
  otpRateLimiter,
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .isLength({ min: 9, max: 10 })
      .withMessage('Invalid phone number format')
  ],
  requestOTP
);

router.post(
  '/otp/verify',
  authRateLimiter,
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required'),
    body('code')
      .notEmpty()
      .withMessage('OTP code is required')
      .isLength({ min: 4, max: 6 })
      .withMessage('Invalid OTP code')
  ],
  verifyOTPAndLogin
);

router.post(
  '/register',
  authRateLimiter,
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('firstName')
      .notEmpty()
      .withMessage('First name is required'),
    body('lastName')
      .notEmpty()
      .withMessage('Last name is required'),
    body('gender')
      .isIn(['Male', 'Female', 'Other'])
      .withMessage('Invalid gender'),
    body('dateOfBirth')
      .notEmpty()
      .withMessage('Date of birth is required'),
    body('weight')
      .isFloat({ min: 0 })
      .withMessage('Weight must be a positive number'),
    body('height')
      .isFloat({ min: 0 })
      .withMessage('Height must be a positive number')
  ],
  register
);

// ============================================
// Protected Auth Endpoints
// ============================================

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, sensitiveRateLimiter, updateProfile);

// Logout - invalidates current token
router.post('/logout', authenticate, logout);

// Change password - rate limited (sensitive operation)
router.post(
  '/change-password',
  authenticate,
  sensitiveRateLimiter,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
  ],
  changePassword
);

export default router;
