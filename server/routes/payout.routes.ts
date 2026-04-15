import { Router } from 'express';
import { getPayouts, createPayout } from '../controllers/payout.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { upload } from '../utils/upload.js';

const router = Router();

router.get('/', authenticateToken, getPayouts);
router.post('/', authenticateToken, upload.single('receipt'), createPayout);

export default router;
