import { Router } from 'express';
import { scanInvoice } from '../controllers/ocr.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { upload } from '../utils/upload.js';

const router = Router();

router.post('/scan', authenticateToken, upload.array('files'), scanInvoice);

export default router;
