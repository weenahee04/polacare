import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCases,
  getCaseById,
  createCase
} from '../controllers/caseController';

const router = Router();

router.use(authenticate);

router.get('/', getCases);
router.get('/:id', getCaseById);
router.post('/', createCase);

export default router;

