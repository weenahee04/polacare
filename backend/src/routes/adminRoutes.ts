import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireDoctor } from '../middleware/roleAuth';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats
} from '../controllers/adminController';
import {
  searchPatients,
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  finalizeCase,
  getCaseAuditTrail,
  getDefaultChecklist
} from '../controllers/staffCaseController';
import { getAuditLogs } from '../services/auditService';

const router = Router();

router.use(authenticate);

// ============================================
// Staff Routes (Doctor + Admin)
// ============================================

// Patient search (for case assignment)
router.get('/patients/search', requireDoctor, searchPatients);

// Case management
router.get('/cases', requireDoctor, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['Draft', 'Finalized'])
], getAllCases);

router.get('/cases/checklist/default', requireDoctor, getDefaultChecklist);

router.get('/cases/:id', requireDoctor, getCaseById);

router.post('/cases', requireDoctor, [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required')
], createCase);

router.put('/cases/:id', requireDoctor, updateCase);

router.post('/cases/:id/finalize', requireDoctor, finalizeCase);

router.get('/cases/:id/audit', requireDoctor, getCaseAuditTrail);

// ============================================
// Admin-Only Routes
// ============================================

// Dashboard (admin only)
router.get('/dashboard/stats', requireAdmin, getDashboardStats);

// Audit logs (admin only)
router.get('/audit-logs', requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, userId, action, resourceType, dateFrom, dateTo } = req.query;
    const result = await getAuditLogs(
      parseInt(page as string),
      parseInt(limit as string),
      {
        userId: userId as string,
        action: action as any,
        resourceType: resourceType as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      }
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// User management (admin only)
router.get('/users', requireAdmin, [
  query('role').optional().isIn(['patient', 'doctor', 'admin']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], getAllUsers);

router.get('/users/:id', requireAdmin, getUserById);

router.post('/users', requireAdmin, [
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('hn').notEmpty().withMessage('HN is required'),
  body('role').isIn(['patient', 'doctor', 'admin']).withMessage('Invalid role'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('weight').isFloat({ min: 0 }).withMessage('Weight must be positive'),
  body('height').isFloat({ min: 0 }).withMessage('Height must be positive')
], createUser);

router.put('/users/:id', requireAdmin, updateUser);
router.delete('/users/:id', requireAdmin, deleteUser);

export default router;

