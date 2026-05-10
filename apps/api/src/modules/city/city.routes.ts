import { Router } from 'express';
import { cityController } from './city.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Public city routes
router.get('/', cityController.listCities);
router.get('/:id/suggestions', cityController.getSuggestions);
router.get('/:id', cityController.getCity);

// Activities list (also mounted at /api/activities via app.ts)
router.get('/activities', cityController.listActivities);

// Section activity management — authenticated
router.post('/trips/:tripId/sections/:sectionId/activities', authenticate, cityController.addActivity);
router.patch('/trips/:tripId/sections/:sectionId/activities/:actId', authenticate, cityController.updateActivity);
router.delete('/trips/:tripId/sections/:sectionId/activities/:actId', authenticate, cityController.removeActivity);

export default router;
