import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export const getCases = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cases = await prisma.patientCase.findMany({
      where: { patientId: req.user!.id },
      include: {
        checklistItems: true,
        images: {
          select: {
            id: true,
            imageUrl: true,
            thumbnailUrl: true,
            imageType: true,
            eyeSide: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({ cases });
  } catch (error) {
    next(error);
  }
};

export const getCaseById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const caseData = await prisma.patientCase.findFirst({
      where: {
        id,
        patientId: req.user!.id
      },
      include: {
        checklistItems: true,
        images: {
          orderBy: { order: 'asc' }
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

export const createCase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      hn,
      patientName,
      date,
      aiAnalysisText,
      doctorNotes,
      diagnosis,
      leftEye,
      rightEye,
      checklist
    } = req.body;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { hn: true, name: true }
    });

    const caseData = await prisma.patientCase.create({
      data: {
        patientId: req.user!.id,
        hn: hn || user?.hn || '',
        patientName: patientName || user?.name || 'Patient',
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
        status: 'Finalized',
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

    res.status(201).json({ case: caseData });
  } catch (error) {
    next(error);
  }
};
