import { Router } from 'express';
import { tripController } from './trip.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Copy trip — must be before /:id routes to prevent "copy" being treated as UUID
router.post('/copy/:slug', authenticate, tripController.copyTrip);

// Trip CRUD
router.get('/', authenticate, tripController.list);
router.post('/', authenticate, tripController.create);
router.get('/:id', authenticate, tripController.getOne);
router.patch('/:id', authenticate, tripController.update);
router.delete('/:id', authenticate, tripController.softDelete);

// Trip actions
router.get('/:id/itinerary', authenticate, tripController.getItinerary);
router.post('/:id/publish', authenticate, tripController.publish);
router.post('/:id/unpublish', authenticate, tripController.unpublish);

// Sections
router.get('/:tripId/sections', authenticate, tripController.listSections);
router.post('/:tripId/sections', authenticate, tripController.createSection);
router.patch('/:tripId/sections/:id', authenticate, tripController.updateSection);
router.delete('/:tripId/sections/:id', authenticate, tripController.deleteSection);

export default router;
