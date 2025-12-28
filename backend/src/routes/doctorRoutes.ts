import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireDoctor } from '../middleware/roleAuth';
import {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  getMyPatients,
  getDoctorDashboard
} from '../controllers/doctorController';

const router = Router();

router.use(authenticate);
router.use(requireDoctor);

// Dashboard
router.get('/dashboard', getDoctorDashboard);

// Cases management
router.get('/cases', getAllCases);
router.get('/cases/:id', getCaseById);
router.post('/cases', createCase);
router.put('/cases/:id', updateCase);

// Patients
router.get('/patients', getMyPatients);

export default router;

