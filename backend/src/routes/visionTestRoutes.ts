import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getVisionTests,
  createVisionTest,
  getVisionTestById,
  deleteVisionTest
} from '../controllers/visionTestController';

const router = Router();

router.use(authenticate);

router.get('/', getVisionTests);
router.post('/', createVisionTest);
router.get('/:id', getVisionTestById);
router.delete('/:id', deleteVisionTest);

export default router;
