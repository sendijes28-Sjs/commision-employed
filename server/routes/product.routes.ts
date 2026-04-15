import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, importProducts } from '../controllers/product.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getProducts);
router.post('/', authenticateToken, authorizeRoles('admin', 'super_admin'), createProduct);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'super_admin'), updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'super_admin'), deleteProduct);
router.post('/import', authenticateToken, authorizeRoles('admin', 'super_admin'), importProducts);

export default router;
