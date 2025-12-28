import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { sensitiveRateLimiter } from '../middleware/security';
import {
  getMedications,
  getMedicationsWithStatus,
  createMedication,
  updateMedication,
  deleteMedication,
  logMedicationTaken,
  getMedicationLogs,
  getMedicationAdherence,
  getMedicationHistory
} from '../controllers/medicationController';

const router = Router();

router.use(authenticate);

// Adherence tracking (must be before /:id routes)
router.get('/adherence/rate', getMedicationAdherence);

// Medication history (all logs)
router.get('/history', getMedicationHistory);

// Get medications with last taken status
router.get('/status', getMedicationsWithStatus);

// Core medication CRUD
router.get('/', getMedications);
router.post('/', sensitiveRateLimiter, createMedication);
router.put('/:id', sensitiveRateLimiter, updateMedication);
router.delete('/:id', sensitiveRateLimiter, deleteMedication);

// Medication logging (rate limited - sensitive action)
router.post('/:id/log', sensitiveRateLimiter, logMedicationTaken);
router.get('/:id/logs', getMedicationLogs);

export default router;
