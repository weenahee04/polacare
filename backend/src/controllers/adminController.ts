import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';
import bcrypt from 'bcryptjs';

// Get all users
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { hn: { contains: search as string, mode: 'insensitive' } },
        { phoneNumber: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          licenseNumber: true,
          specialization: true,
          department: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        licenseNumber: true,
        specialization: true,
        department: true,
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

// Create user (admin/doctor)
export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      phoneNumber,
      password,
      name,
      hn,
      role,
      gender,
      dateOfBirth,
      weight,
      height,
      licenseNumber,
      specialization,
      department
    } = req.body;

    // Check if user exists
    const existingByPhone = await prisma.user.findUnique({ where: { phoneNumber } });
    const existingByHn = await prisma.user.findUnique({ where: { hn } });

    if (existingByPhone || existingByHn) {
      throw new AppError('User with this phone number or HN already exists', 409);
    }

    // Calculate BMI
    const heightM = parseFloat(height) / 100;
    const bmi = parseFloat(weight) / (heightM * heightM);

    const user = await prisma.user.create({
      data: {
        phoneNumber,
        password: await bcrypt.hash(password, 10),
        name,
        hn,
        role: role || 'patient',
        gender,
        dateOfBirth: new Date(dateOfBirth),
        weight: parseFloat(weight),
        height: parseFloat(height),
        bmi: parseFloat(bmi.toFixed(2)),
        isVerified: true,
        licenseNumber,
        specialization,
        department
      }
    });

    logger.info('User created by admin', {
      createdBy: req.user?.id,
      userId: user.id,
      role: user.role
    });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        hn: user.hn,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: any = req.body;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Recalculate BMI if weight or height changed
    if (updateData.weight || updateData.height) {
      const finalWeight = updateData.weight || Number(user.weight);
      const finalHeight = updateData.height || Number(user.height);
      const heightM = finalHeight / 100;
      updateData.bmi = parseFloat((finalWeight / (heightM * heightM)).toFixed(2));
    }

    // Convert dateOfBirth if provided
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        hn: true,
        phoneNumber: true,
        role: true,
        isActive: true
      }
    });

    logger.info('User updated by admin', {
      updatedBy: req.user?.id,
      userId: user.id
    });

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// Delete/Deactivate user
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Soft delete - deactivate instead of delete
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info('User deactivated by admin', {
      deactivatedBy: req.user?.id,
      userId: user.id
    });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// Get dashboard stats
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAdmins,
      totalCases,
      recentCases
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'patient' } }),
      prisma.user.count({ where: { role: 'doctor' } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.patientCase.count(),
      prisma.patientCase.count({
        where: {
          createdAt: { gte: sevenDaysAgo }
        }
      })
    ]);

    res.json({
      stats: {
        users: {
          total: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors,
          admins: totalAdmins
        },
        cases: {
          total: totalCases,
          recent: recentCases
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
