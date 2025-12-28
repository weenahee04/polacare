/**
 * Staff Case Controller
 * 
 * Handles patient case management for staff (doctors/admins).
 * Includes CRUD, patient assignment, and audit trail.
 */

import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/prisma';
import logger from '../config/logger';
import {
  logCaseCreated,
  logCaseUpdated,
  logCaseStatusChange,
  getAuditLogsForResource
} from '../services/auditService';

/**
 * Search patients by HN or phone
 * GET /api/v1/admin/patients/search?q=HN-123
 */
export const searchPatients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      res.json({ patients: [] });
      return;
    }

    const patients = await prisma.user.findMany({
      where: {
        role: 'patient',
        isActive: true,
        OR: [
          { hn: { contains: q, mode: 'insensitive' } },
          { phoneNumber: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        hn: true,
        phoneNumber: true,
        avatarUrl: true,
        gender: true,
        dateOfBirth: true
      },
      take: parseInt(limit as string)
    });

    res.json({ patients });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all cases (with filters)
 * GET /api/v1/admin/cases
 */
export const getAllCases = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      patientId,
      search,
      dateFrom,
      dateTo
    } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (patientId) where.patientId = patientId;
    if (search) {
      where.OR = [
        { diagnosis: { contains: search as string, mode: 'insensitive' } },
        { patientName: { contains: search as string, mode: 'insensitive' } },
        { hn: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [cases, total] = await Promise.all([
      prisma.patientCase.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              hn: true,
              phoneNumber: true,
              avatarUrl: true
            }
          },
          images: {
            select: {
              id: true,
              thumbnailUrl: true,
              imageType: true
            },
            take: 1,
            orderBy: { order: 'asc' }
          },
          createdByDoctor: {
            select: {
              id: true,
              name: true
            }
          }
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' }
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

/**
 * Get case by ID
 * GET /api/v1/admin/cases/:id
 */
export const getCaseById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const caseRecord = await prisma.patientCase.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            hn: true,
            phoneNumber: true,
            avatarUrl: true,
            gender: true,
            dateOfBirth: true
          }
        },
        images: {
          orderBy: { order: 'asc' }
        },
        checklistItems: {
          orderBy: { category: 'asc' }
        },
        createdByDoctor: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!caseRecord) {
      throw new AppError('Case not found', 404);
    }

    res.json({ case: caseRecord });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new case
 * POST /api/v1/admin/cases
 */
export const createCase = async (
  req: AuthRequest,
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
      patientId,
      diagnosis,
      doctorNotes,
      aiAnalysisText,
      status,
      leftEye,
      rightEye,
      checklistItems
    } = req.body;

    // Verify patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, name: true, hn: true }
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Create case with checklist items
    const newCase = await prisma.patientCase.create({
      data: {
        patientId,
        hn: patient.hn,
        patientName: patient.name,
        date: new Date(),
        diagnosis,
        doctorNotes,
        aiAnalysisText,
        status: status || 'Draft',
        leftEyeVisualAcuity: leftEye?.visualAcuity,
        leftEyeIntraocularPressure: leftEye?.intraocularPressure,
        leftEyeDiagnosis: leftEye?.diagnosis,
        leftEyeNote: leftEye?.note,
        rightEyeVisualAcuity: rightEye?.visualAcuity,
        rightEyeIntraocularPressure: rightEye?.intraocularPressure,
        rightEyeDiagnosis: rightEye?.diagnosis,
        rightEyeNote: rightEye?.note,
        createdBy: req.user?.id,
        checklistItems: checklistItems?.length > 0 ? {
          create: checklistItems.map((item: any) => ({
            category: item.category,
            label: item.label,
            isObserved: item.isObserved || false,
            isVerified: item.isVerified || false
          }))
        } : undefined
      },
      include: {
        checklistItems: true,
        patient: {
          select: {
            id: true,
            name: true,
            hn: true
          }
        }
      }
    });

    // Audit log
    await logCaseCreated(
      req.user?.id || '',
      newCase.id,
      { patientId, diagnosis, status: newCase.status },
      req.ip
    );

    logger.info('Case created', {
      caseId: newCase.id,
      patientId,
      createdBy: req.user?.id
    });

    res.status(201).json({
      case: newCase,
      message: 'Case created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update case
 * PUT /api/v1/admin/cases/:id
 */
export const updateCase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      doctorNotes,
      aiAnalysisText,
      status,
      leftEye,
      rightEye,
      checklistItems
    } = req.body;

    // Get existing case
    const existingCase = await prisma.patientCase.findUnique({
      where: { id },
      include: { checklistItems: true }
    });

    if (!existingCase) {
      throw new AppError('Case not found', 404);
    }

    // Track changes for audit
    const changes: Record<string, any> = {};
    if (diagnosis && diagnosis !== existingCase.diagnosis) {
      changes.diagnosis = { from: existingCase.diagnosis, to: diagnosis };
    }
    if (doctorNotes && doctorNotes !== existingCase.doctorNotes) {
      changes.doctorNotes = { from: existingCase.doctorNotes, to: doctorNotes };
    }
    if (status && status !== existingCase.status) {
      changes.status = { from: existingCase.status, to: status };
    }

    // Update case
    const updatedCase = await prisma.patientCase.update({
      where: { id },
      data: {
        diagnosis: diagnosis ?? existingCase.diagnosis,
        doctorNotes: doctorNotes ?? existingCase.doctorNotes,
        aiAnalysisText: aiAnalysisText ?? existingCase.aiAnalysisText,
        status: status ?? existingCase.status,
        leftEyeVisualAcuity: leftEye?.visualAcuity ?? existingCase.leftEyeVisualAcuity,
        leftEyeIntraocularPressure: leftEye?.intraocularPressure ?? existingCase.leftEyeIntraocularPressure,
        leftEyeDiagnosis: leftEye?.diagnosis ?? existingCase.leftEyeDiagnosis,
        leftEyeNote: leftEye?.note ?? existingCase.leftEyeNote,
        rightEyeVisualAcuity: rightEye?.visualAcuity ?? existingCase.rightEyeVisualAcuity,
        rightEyeIntraocularPressure: rightEye?.intraocularPressure ?? existingCase.rightEyeIntraocularPressure,
        rightEyeDiagnosis: rightEye?.diagnosis ?? existingCase.rightEyeDiagnosis,
        rightEyeNote: rightEye?.note ?? existingCase.rightEyeNote
      },
      include: {
        checklistItems: true,
        patient: {
          select: {
            id: true,
            name: true,
            hn: true
          }
        },
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // Update checklist items if provided
    if (checklistItems && checklistItems.length > 0) {
      // Delete existing and recreate
      await prisma.checklistItem.deleteMany({
        where: { caseId: id }
      });

      await prisma.checklistItem.createMany({
        data: checklistItems.map((item: any) => ({
          caseId: id,
          category: item.category,
          label: item.label,
          isObserved: item.isObserved || false,
          isVerified: item.isVerified || false
        }))
      });
    }

    // Audit log
    if (Object.keys(changes).length > 0) {
      await logCaseUpdated(
        req.user?.id || '',
        id,
        changes,
        req.ip
      );
    }

    if (status && status !== existingCase.status) {
      await logCaseStatusChange(
        req.user?.id || '',
        id,
        existingCase.status,
        status,
        req.ip
      );
    }

    logger.info('Case updated', {
      caseId: id,
      updatedBy: req.user?.id,
      changes
    });

    res.json({
      case: updatedCase,
      message: 'Case updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Finalize case
 * POST /api/v1/admin/cases/:id/finalize
 */
export const finalizeCase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const existingCase = await prisma.patientCase.findUnique({
      where: { id }
    });

    if (!existingCase) {
      throw new AppError('Case not found', 404);
    }

    if (existingCase.status === 'Finalized') {
      throw new AppError('Case is already finalized', 400);
    }

    const updatedCase = await prisma.patientCase.update({
      where: { id },
      data: { status: 'Finalized' }
    });

    await logCaseStatusChange(
      req.user?.id || '',
      id,
      'Draft',
      'Finalized',
      req.ip
    );

    logger.info('Case finalized', {
      caseId: id,
      finalizedBy: req.user?.id
    });

    res.json({
      case: updatedCase,
      message: 'Case finalized successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get case audit trail
 * GET /api/v1/admin/cases/:id/audit
 */
export const getCaseAuditTrail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const logs = await getAuditLogsForResource('PatientCase', id);

    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

/**
 * Default checklist items for slit lamp exam
 */
export const getDefaultChecklist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const defaultItems = [
      { category: 'Lids/Lashes', label: 'Lids and lashes examination', isObserved: false, isVerified: false },
      { category: 'Conjunctiva', label: 'Conjunctiva examination', isObserved: false, isVerified: false },
      { category: 'Cornea', label: 'Cornea clarity and surface', isObserved: false, isVerified: false },
      { category: 'Anterior Chamber', label: 'Anterior chamber depth and clarity', isObserved: false, isVerified: false },
      { category: 'Iris', label: 'Iris pattern and color', isObserved: false, isVerified: false },
      { category: 'Lens', label: 'Lens clarity', isObserved: false, isVerified: false },
      { category: 'Pupil', label: 'Pupil size and reactivity', isObserved: false, isVerified: false },
      { category: 'Vitreous', label: 'Vitreous examination', isObserved: false, isVerified: false }
    ];

    res.json({ items: defaultItems });
  } catch (error) {
    next(error);
  }
};

