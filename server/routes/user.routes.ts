import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
} from '../controllers/user.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema } from '../utils/schemas.js';

const router = Router();

router.get('/', authenticateToken, authorizeRoles('super_admin', 'admin'), getUsers);
router.post('/', authenticateToken, authorizeRoles('super_admin'), validate(createUserSchema), createUser);
router.put('/:id', authenticateToken, authorizeRoles('super_admin'), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), deleteUser);
router.post('/:id/reset-password', authenticateToken, authorizeRoles('super_admin'), resetPassword);

export default router;
