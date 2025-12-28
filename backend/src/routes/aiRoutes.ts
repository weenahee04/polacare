import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/security';
import { upload, processImage } from '../middleware/fileUpload';
import { analyzeMedicalImage, analyzeRetinalAge } from '../services/aiService';

const router = Router();

router.use(authenticate);
router.use(aiRateLimiter);

router.post('/analyze-image', upload.single('image'), processImage, async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const result = await analyzeMedicalImage(base64Data, mimeType);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/retinal-age', upload.single('image'), processImage, async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const { actualAge } = req.body;

    if (!actualAge || isNaN(parseInt(actualAge))) {
      res.status(400).json({ error: 'Actual age is required' });
      return;
    }

    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const result = await analyzeRetinalAge(base64Data, mimeType, parseInt(actualAge));

    if (!result) {
      res.status(500).json({ error: 'Failed to analyze retinal age' });
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
