import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getVisionTests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tests = await prisma.visionTestResult.findMany({
      where: { patientId: req.user!.id },
      orderBy: { testDate: 'desc' }
    });

    res.json({ tests });
  } catch (error) {
    next(error);
  }
};

export const createVisionTest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { testName, testType, result, details, testDate } = req.body;

    const test = await prisma.visionTestResult.create({
      data: {
        patientId: req.user!.id,
        testName,
        testType: testType || 'Other',
        result,
        details: details || '',
        testDate: testDate ? new Date(testDate) : new Date()
      }
    });

    res.status(201).json({ test });
  } catch (error) {
    next(error);
  }
};

export const getVisionTestById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const test = await prisma.visionTestResult.findFirst({
      where: {
        id,
        patientId: req.user!.id
      }
    });

    if (!test) {
      res.status(404).json({ error: 'Vision test not found' });
      return;
    }

    res.json({ test });
  } catch (error) {
    next(error);
  }
};

export const deleteVisionTest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const test = await prisma.visionTestResult.findFirst({
      where: {
        id,
        patientId: req.user!.id
      }
    });

    if (!test) {
      res.status(404).json({ error: 'Vision test not found' });
      return;
    }

    await prisma.visionTestResult.delete({
      where: { id }
    });

    res.json({ message: 'Vision test deleted successfully' });
  } catch (error) {
    next(error);
  }
};
