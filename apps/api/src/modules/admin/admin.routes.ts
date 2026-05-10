import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role-guard';

const router = Router();

// All admin routes require JWT + admin role
router.use(authenticate, requireRole('admin'));

router.get('/users', adminController.listUsers);
router.patch('/users/:id', adminController.updateUser);
router.get('/analytics', adminController.getAnalytics);
router.get('/popular-cities', adminController.getPopularCities);
router.get('/popular-activities', adminController.getPopularActivities);

export default router;
