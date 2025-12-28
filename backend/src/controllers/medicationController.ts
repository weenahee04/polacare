import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export const getMedications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { active } = req.query;

    const where: any = { patientId: req.user!.id };
    if (active === 'true') {
      where.isActive = true;
    }

    const medications = await prisma.medication.findMany({
      where,
      include: {
        logs: {
          take: 5,
          orderBy: { scheduledTime: 'desc' }
        }
      },
      orderBy: { nextTime: 'asc' }
    });

    res.json({ medications });
  } catch (error) {
    next(error);
  }
};

export const createMedication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { medicineName, frequency, nextTime, type, dosage, startDate, endDate } = req.body;

    const medication = await prisma.medication.create({
      data: {
        patientId: req.user!.id,
        medicineName,
        frequency: frequency || 'Daily',
        nextTime,
        type: type || 'drop',
        dosage,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true
      }
    });

    res.status(201).json({ medication });
  } catch (error) {
    next(error);
  }
};

export const updateMedication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { medicineName, frequency, nextTime, type, dosage, isActive } = req.body;

    const medication = await prisma.medication.findFirst({
      where: {
        id,
        patientId: req.user!.id
      }
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    const updatedMedication = await prisma.medication.update({
      where: { id },
      data: {
        medicineName: medicineName ?? medication.medicineName,
        frequency: frequency ?? medication.frequency,
        nextTime: nextTime ?? medication.nextTime,
        type: type ?? medication.type,
        dosage: dosage ?? medication.dosage,
        isActive: isActive ?? medication.isActive
      }
    });

    res.json({ medication: updatedMedication });
  } catch (error) {
    next(error);
  }
};

export const deleteMedication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const medication = await prisma.medication.findFirst({
      where: {
        id,
        patientId: req.user!.id
      }
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    await prisma.medication.delete({
      where: { id }
    });

    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Log medication as taken
export const logMedicationTaken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { scheduledTime, notes } = req.body;

    const medication = await prisma.medication.findFirst({
      where: {
        id,
        patientId: req.user!.id
      }
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    const log = await prisma.medicationLog.create({
      data: {
        medicationId: id,
        patientId: req.user!.id,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : new Date(),
        takenAt: new Date(),
        taken: true,
        notes
      }
    });

    res.status(201).json({ log });
  } catch (error) {
    next(error);
  }
};

// Get medication logs
export const getMedicationLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    const medication = await prisma.medication.findFirst({
      where: {
        id,
        patientId: req.user!.id
      }
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    const where: any = { medicationId: id };

    if (startDate || endDate) {
      where.scheduledTime = {};
      if (startDate) where.scheduledTime.gte = new Date(startDate as string);
      if (endDate) where.scheduledTime.lte = new Date(endDate as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [logs, total] = await Promise.all([
      prisma.medicationLog.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { scheduledTime: 'desc' }
      }),
      prisma.medicationLog.count({ where })
    ]);

    res.json({
      logs,
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

// Get medication adherence rate
export const getMedicationAdherence = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const [totalLogs, takenLogs] = await Promise.all([
      prisma.medicationLog.count({
        where: {
          patientId: req.user!.id,
          scheduledTime: { gte: startDate }
        }
      }),
      prisma.medicationLog.count({
        where: {
          patientId: req.user!.id,
          scheduledTime: { gte: startDate },
          taken: true
        }
      })
    ]);

    const adherenceRate = totalLogs > 0 ? (takenLogs / totalLogs) * 100 : 0;

    res.json({
      adherence: {
        rate: parseFloat(adherenceRate.toFixed(2)),
        totalScheduled: totalLogs,
        totalTaken: takenLogs,
        periodDays: parseInt(days as string)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all medication history (logs across all medications)
export const getMedicationHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 50, days } = req.query;

    const where: any = { patientId: req.user!.id };

    // Filter by date range if specified
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));
      where.scheduledTime = { gte: startDate };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [logs, total] = await Promise.all([
      prisma.medicationLog.findMany({
        where,
        include: {
          medication: {
            select: {
              id: true,
              medicineName: true,
              type: true,
              dosage: true
            }
          }
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { scheduledTime: 'desc' }
      }),
      prisma.medicationLog.count({ where })
    ]);

    res.json({
      logs,
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

// Get medication with last taken time
export const getMedicationsWithStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { active } = req.query;

    const where: any = { patientId: req.user!.id };
    if (active === 'true') {
      where.isActive = true;
    }

    const medications = await prisma.medication.findMany({
      where,
      include: {
        logs: {
          where: { taken: true },
          take: 1,
          orderBy: { takenAt: 'desc' }
        },
        _count: {
          select: { logs: true }
        }
      },
      orderBy: { nextTime: 'asc' }
    });

    // Format response with last taken info
    const medicationsWithStatus = medications.map(med => ({
      id: med.id,
      medicineName: med.medicineName,
      type: med.type,
      frequency: med.frequency,
      nextTime: med.nextTime,
      dosage: med.dosage,
      startDate: med.startDate,
      endDate: med.endDate,
      isActive: med.isActive,
      lastTakenAt: med.logs[0]?.takenAt || null,
      totalLogs: med._count.logs,
      createdAt: med.createdAt,
      updatedAt: med.updatedAt
    }));

    res.json({ medications: medicationsWithStatus });
  } catch (error) {
    next(error);
  }
};
