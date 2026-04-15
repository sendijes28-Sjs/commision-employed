import { Router } from 'express';
import { getStats, getCounts } from '../controllers/stats.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getStats);
router.get('/counts', authenticateToken, getCounts);

export default router;
