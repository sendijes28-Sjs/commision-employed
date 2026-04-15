import { Router } from 'express';
import {
  getInvoices,
  getInvoiceByNumber,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice
} from '../controllers/invoice.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createInvoiceSchema } from '../utils/schemas.js';

const router = Router();

router.get('/', authenticateToken, getInvoices);
router.get('/:invoice_number', authenticateToken, getInvoiceByNumber);
router.post('/', authenticateToken, validate(createInvoiceSchema), createInvoice);
router.put('/:id/status', authenticateToken, authorizeRoles('super_admin'), updateInvoiceStatus);
router.delete('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), deleteInvoice);

export default router;
