import { Router } from 'express';
import { communityController } from './community.controller';

const router = Router();

router.get('/posts', communityController.listPosts);
router.get('/:slug', communityController.getPublicTrip);

export default router;
