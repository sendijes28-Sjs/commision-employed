import { Router } from 'express';
import { getCommissions } from '../controllers/commission.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getCommissions);

export default router;
