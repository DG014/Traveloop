import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { notesService, createNoteSchema, updateNoteSchema } from './notes.service';
import { ok, err, ErrorCodes } from '../../lib/response';
import { qs, qsNum, p } from '../../lib/qs';

export const notesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const notes = await notesService.listNotes(req.user!.userId, p(req.params.tripId), { dayNumber: qsNum(req.query.dayNumber), sectionId: qs(req.query.sectionId) });
      res.json(ok(notes));
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createNoteSchema.parse(req.body);
      res.status(201).json(ok(await notesService.createNote(req.user!.userId, p(req.params.tripId), data)));
    } catch (e) {
      if (e instanceof ZodError) { const fe = e.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message)); }
      next(e);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateNoteSchema.parse(req.body);
      res.json(ok(await notesService.updateNote(req.user!.userId, p(req.params.tripId), p(req.params.noteId), data)));
    } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await notesService.deleteNote(req.user!.userId, p(req.params.tripId), p(req.params.noteId)))); } catch (e) { next(e); }
  },
};
