import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { checklistService, createChecklistItemSchema, toggleItemSchema } from './checklist.service';
import { ok, err, ErrorCodes } from '../../lib/response';
import { p } from '../../lib/qs';

export const checklistController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await checklistService.getChecklist(req.user!.userId, p(req.params.tripId)))); } catch (e) { next(e); }
  },
  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createChecklistItemSchema.parse(req.body);
      res.status(201).json(ok(await checklistService.addItem(req.user!.userId, p(req.params.tripId), data)));
    } catch (e) {
      if (e instanceof ZodError) { const fe = e.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message)); }
      next(e);
    }
  },
  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const { isPacked } = toggleItemSchema.parse(req.body);
      res.json(ok(await checklistService.toggleItem(req.user!.userId, p(req.params.tripId), p(req.params.itemId), isPacked)));
    } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await checklistService.deleteItem(req.user!.userId, p(req.params.tripId), p(req.params.itemId)))); } catch (e) { next(e); }
  },
  async reset(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await checklistService.resetChecklist(req.user!.userId, p(req.params.tripId)))); } catch (e) { next(e); }
  },
};
