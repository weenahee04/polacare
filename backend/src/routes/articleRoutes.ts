import { Router } from 'express';
import {
  getArticles,
  getArticleById,
  getArticleCategories,
  getPopularArticles
} from '../controllers/articleController';

const router = Router();

// Public routes - no authentication required
router.get('/', getArticles);
router.get('/categories', getArticleCategories);
router.get('/popular', getPopularArticles);
router.get('/:id', getArticleById);

export default router;
