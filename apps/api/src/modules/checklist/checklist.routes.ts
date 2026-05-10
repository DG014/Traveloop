import { Router } from 'express';
import { checklistController } from './checklist.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router({ mergeParams: true });

// These routes are nested under /api/trips/:tripId/checklist via trip.routes
// But also independently accessible
router.get('/trips/:tripId/checklist', authenticate, checklistController.get);
router.post('/trips/:tripId/checklist', authenticate, checklistController.add);
router.post('/trips/:tripId/checklist/reset', authenticate, checklistController.reset);
router.patch('/trips/:tripId/checklist/:itemId', authenticate, checklistController.toggle);
router.delete('/trips/:tripId/checklist/:itemId', authenticate, checklistController.remove);

export default router;
