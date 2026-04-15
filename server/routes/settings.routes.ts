import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getSettings);
router.put('/', authenticateToken, updateSettings);
router.post('/', authenticateToken, updateSettings);

export default router;
