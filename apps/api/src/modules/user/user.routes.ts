import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadPhoto } from '../../middleware/upload.middleware';

const router = Router();
router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me', userController.updateProfile);
router.post('/me/photo', uploadPhoto, userController.uploadPhoto);

export default router;
