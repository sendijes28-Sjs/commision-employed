import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../utils/schemas.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticateToken, getMe);

export default router;
