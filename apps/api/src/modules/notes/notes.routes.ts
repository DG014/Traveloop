import { Router } from 'express';
import { notesController } from './notes.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/trips/:tripId/notes', authenticate, notesController.list);
router.post('/trips/:tripId/notes', authenticate, notesController.create);
router.patch('/trips/:tripId/notes/:noteId', authenticate, notesController.update);
router.delete('/trips/:tripId/notes/:noteId', authenticate, notesController.remove);

export default router;
