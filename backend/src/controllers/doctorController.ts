import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

// Get all cases (doctor can see all cases)
export const getAllCases = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { patientId, status, page = 1, limit = 20, search } = req.query;

    const where: any = {};
    if (patientId) {
      where.patientId = patientId;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { patientName: { contains: search as string, mode: 'insensitive' } },
        { hn: { contains: search as string, mode: 'insensitive' } },
        { diagnosis: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [cases, total] = await Promise.all([
      prisma.patientCase.findMany({
        where,
        include: {
          checklistItems: true,
          patient: {
            select: {
              id: true,
              name: true,
              hn: true,
              phoneNumber: true,
              gender: true,
              dateOfBirth: true
            }
          }
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { date: 'desc' }
      }),
      prisma.patientCase.count({ where })
    ]);

    res.json({
      cases,
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

// Get case by ID
export const getCaseById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const caseData = await prisma.patientCase.findUnique({
      where: { id },
      include: {
        checklistItems: true,
        images: {
          orderBy: { order: 'asc' }
        },
        patient: {
          select: {
            id: true,
            name: true,
            hn: true,
            phoneNumber: true,
            gender: true,
            dateOfBirth: true
          }
        }
      }
    });

    if (!caseData) {
      throw new AppError('Case not found', 404);
    }

    res.json({ case: caseData });
  } catch (error) {
    next(error);
  }
};

// Create case (doctor creates case for patient)
export const createCase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      patientId,
      hn,
      patientName,
      date,
      aiAnalysisText,
      doctorNotes,
      diagnosis,
      leftEye,
      rightEye,
      checklist,
      status
    } = req.body;

    // Verify patient exists
    let patient = null;
    if (patientId) {
      patient = await prisma.user.findUnique({ where: { id: patientId } });
    } else if (hn) {
      patient = await prisma.user.findUnique({ where: { hn } });
    }

    if (!patient && patientId) {
      throw new AppError('Patient not found', 404);
    }

    const caseData = await prisma.patientCase.create({
      data: {
        patientId: patientId || patient?.id || '',
        hn: hn || patient?.hn || '',
        patientName: patientName || patient?.name || '',
        date: date ? new Date(date) : new Date(),
        aiAnalysisText: aiAnalysisText || '',
        doctorNotes,
        diagnosis,
        leftEyeVisualAcuity: leftEye?.visualAcuity,
        leftEyeIntraocularPressure: leftEye?.intraocularPressure,
        leftEyeDiagnosis: leftEye?.diagnosis,
        leftEyeNote: leftEye?.note,
        rightEyeVisualAcuity: rightEye?.visualAcuity,
        rightEyeIntraocularPressure: rightEye?.intraocularPressure,
        rightEyeDiagnosis: rightEye?.diagnosis,
        rightEyeNote: rightEye?.note,
        status: status || 'Finalized',
        createdBy: req.user?.id,
        checklistItems: checklist?.items?.length > 0 ? {
          create: checklist.items.map((item: any) => ({
            category: item.category,
            label: item.label,
            isObserved: item.isObserved || false,
            isVerified: item.isVerified || false
          }))
        } : undefined
      },
      include: {
        checklistItems: true
      }
    });

    logger.info('Case created by doctor', {
      doctorId: req.user?.id,
      caseId: caseData.id,
      patientId: caseData.patientId
    });

    res.status(201).json({ case: caseData });
  } catch (error) {
    next(error);
  }
};

// Update case
export const updateCase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: any = req.body;

    const caseData = await prisma.patientCase.findUnique({ where: { id } });

    if (!caseData) {
      throw new AppError('Case not found', 404);
    }

    // Build update object
    const dataToUpdate: any = {};
    if (updateData.doctorNotes !== undefined) {
      dataToUpdate.doctorNotes = updateData.doctorNotes;
    }
    if (updateData.diagnosis !== undefined) {
      dataToUpdate.diagnosis = updateData.diagnosis;
    }
    if (updateData.status !== undefined) {
      dataToUpdate.status = updateData.status;
    }
    if (updateData.leftEye) {
      dataToUpdate.leftEyeVisualAcuity = updateData.leftEye.visualAcuity;
      dataToUpdate.leftEyeIntraocularPressure = updateData.leftEye.intraocularPressure;
      dataToUpdate.leftEyeDiagnosis = updateData.leftEye.diagnosis;
      dataToUpdate.leftEyeNote = updateData.leftEye.note;
    }
    if (updateData.rightEye) {
      dataToUpdate.rightEyeVisualAcuity = updateData.rightEye.visualAcuity;
      dataToUpdate.rightEyeIntraocularPressure = updateData.rightEye.intraocularPressure;
      dataToUpdate.rightEyeDiagnosis = updateData.rightEye.diagnosis;
      dataToUpdate.rightEyeNote = updateData.rightEye.note;
    }

    const updatedCase = await prisma.patientCase.update({
      where: { id },
      data: dataToUpdate
    });

    // Update checklist items if provided
    if (updateData.checklist && updateData.checklist.items) {
      // Delete existing items
      await prisma.checklistItem.deleteMany({ where: { caseId: id } });

      // Create new items
      await prisma.checklistItem.createMany({
        data: updateData.checklist.items.map((item: any) => ({
          caseId: id,
          category: item.category,
          label: item.label,
          isObserved: item.isObserved || false,
          isVerified: item.isVerified || false
        }))
      });
    }

    logger.info('Case updated by doctor', {
      doctorId: req.user?.id,
      caseId: id
    });

    const result = await prisma.patientCase.findUnique({
      where: { id },
      include: {
        checklistItems: true
      }
    });

    res.json({ case: result });
  } catch (error) {
    next(error);
  }
};

// Get my patients
export const getMyPatients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const where: any = {
      role: 'patient',
      isActive: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { hn: { contains: search as string, mode: 'insensitive' } },
        { phoneNumber: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [patients, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          bmi: true,
          createdAt: true
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { name: 'asc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      patients,
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

// Get doctor dashboard stats
export const getDoctorDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalCases,
      todayCases,
      pendingCases,
      recentCases
    ] = await Promise.all([
      prisma.patientCase.count(),
      prisma.patientCase.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.patientCase.count({
        where: {
          status: 'Draft'
        }
      }),
      prisma.patientCase.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              hn: true
            }
          }
        }
      })
    ]);

    res.json({
      stats: {
        totalCases,
        todayCases,
        pendingCases
      },
      recentCases
    });
  } catch (error) {
    next(error);
  }
};
