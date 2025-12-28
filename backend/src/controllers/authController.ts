import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import prisma from '../config/prisma';
import { createOTP, verifyOTP } from '../services/otpService';
import { AppError } from '../middleware/errorHandler';
import { validatePassword } from '../utils/passwordValidator';
import { validatePhoneNumber, formatPhoneNumber } from '../utils/phoneValidator';
import { blacklistToken, AuthRequest } from '../middleware/auth';
import logger from '../config/logger';

export const requestOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { phoneNumber } = req.body;

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      throw new AppError('Invalid phone number format', 400);
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    logger.info('OTP request', { phoneNumber: formattedPhone });

    await createOTP(formattedPhone);

    res.json({
      message: 'OTP sent successfully',
      phoneNumber: formattedPhone.replace(/^\+66/, '0')
    });
  } catch (error) {
    logger.error('OTP request failed', { error, phoneNumber: req.body.phoneNumber });
    next(error);
  }
};

export const verifyOTPAndLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { phoneNumber, code } = req.body;

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const isValid = await verifyOTP(formattedPhone, code);

    if (!isValid) {
      logger.warn('Invalid OTP attempt', { phoneNumber: formattedPhone });
      throw new AppError('Invalid or expired OTP', 401);
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phoneNumber: formattedPhone } });

    if (!user) {
      // Create new user with minimal info
      const tempHN = `HN-${Math.floor(Math.random() * 1000000)}`;
      user = await prisma.user.create({
        data: {
          phoneNumber: formattedPhone,
          password: await bcrypt.hash('temp', 10), // Will be updated on registration
          name: 'User',
          hn: tempHN,
          gender: 'Other',
          dateOfBirth: new Date('1990-01-01'),
          weight: 0,
          height: 0,
          bmi: 0,
          isVerified: true
        }
      });
      logger.info('New user created', { userId: user.id, hn: user.hn });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500);
    }
    const signOptions: any = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      signOptions
    );

    logger.info('User logged in', { userId: user.id, hn: user.hn, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        hn: user.hn,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        weight: user.weight,
        height: user.height,
        bmi: user.bmi,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login failed', { error, phoneNumber: req.body.phoneNumber });
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      phoneNumber,
      password,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      weight,
      height,
      avatarUrl
    } = req.body;

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      throw new AppError('Invalid phone number format', 400);
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { phoneNumber: formattedPhone } });

    if (existingUser && existingUser.password !== 'temp') {
      throw new AppError('User already registered', 409);
    }

    // Calculate BMI
    const heightM = parseFloat(height) / 100;
    const bmi = parseFloat(weight) / (heightM * heightM);

    // Generate HN if not exists
    const hn = existingUser?.hn || `HN-${Math.floor(Math.random() * 1000000)}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: any = {
      phoneNumber: formattedPhone,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      hn,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      weight: parseFloat(weight),
      height: parseFloat(height),
      bmi: parseFloat(bmi.toFixed(2)),
      isVerified: true
    };

    if (avatarUrl) {
      userData.avatarUrl = avatarUrl;
    }

    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: userData
      });
      logger.info('User profile updated', { userId: user.id });
    } else {
      user = await prisma.user.create({ data: userData });
      logger.info('New user registered', { userId: user.id, hn: user.hn });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500);
    }
    const signOptions: any = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      signOptions
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        hn: user.hn,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        weight: user.weight,
        height: user.height,
        bmi: user.bmi,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Registration failed', { error, phoneNumber: req.body.phoneNumber });
    next(error);
  }
};

export const getProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        hn: true,
        avatarUrl: true,
        gender: true,
        dateOfBirth: true,
        weight: true,
        height: true,
        bmi: true,
        role: true,
        isVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: any = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.gender) updateData.gender = req.body.gender;
    if (req.body.dateOfBirth) updateData.dateOfBirth = new Date(req.body.dateOfBirth);
    if (req.body.weight) updateData.weight = parseFloat(req.body.weight);
    if (req.body.height) updateData.height = parseFloat(req.body.height);
    if (req.body.avatarUrl) updateData.avatarUrl = req.body.avatarUrl;

    // Recalculate BMI if weight or height changed
    if (updateData.weight || updateData.height) {
      const finalWeight = updateData.weight || Number(user.weight);
      const finalHeight = updateData.height || Number(user.height);
      const heightM = finalHeight / 100;
      updateData.bmi = parseFloat((finalWeight / (heightM * heightM)).toFixed(2));
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        hn: true,
        phoneNumber: true,
        avatarUrl: true,
        gender: true,
        dateOfBirth: true,
        weight: true,
        height: true,
        bmi: true
      }
    });

    logger.info('Profile updated', { userId: user.id });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// Logout - invalidate token
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      blacklistToken(token);
      
      logger.info('User logged out', { userId: req.user?.id });
    }

    // Clear cookie if using cookie auth
    res.clearCookie('polacare_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// Change password (requires current password)
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    const user = await prisma.user.findUnique({ 
      where: { id: req.user!.id },
      select: { id: true, password: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      logger.warn('Invalid password change attempt', { userId: user.id });
      throw new AppError('Current password is incorrect', 401);
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
      return;
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Blacklist current token to force re-login
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      blacklistToken(authHeader.substring(7));
    }

    logger.info('Password changed', { userId: user.id });

    res.json({ 
      message: 'Password changed successfully. Please log in again.',
      requireReAuth: true
    });
  } catch (error) {
    next(error);
  }
};
