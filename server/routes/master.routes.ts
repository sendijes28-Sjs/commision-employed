import { Router } from 'express';
import { importMasterLedger } from '../controllers/master.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/import', authenticateToken, importMasterLedger);

export default router;
