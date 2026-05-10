import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { cityService, addActivitySchema, updateActivitySchema } from './city.service';
import { ok, err, ErrorCodes } from '../../lib/response';
import { qs, qsNum, p } from '../../lib/qs';

export const cityController = {
  async listCities(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cityService.listCities({ q: qs(req.query.q), region: qs(req.query.region), country: qs(req.query.country), costIndex: qs(req.query.costIndex), sort: qs(req.query.sort), page: qsNum(req.query.page, 1), limit: qsNum(req.query.limit, 20) });
      res.json(ok(result.cities, { page: result.page, limit: result.limit, total: result.total }));
    } catch (e) { next(e); }
  },
  async getCity(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await cityService.getCityById(p(req.params.id)))); } catch (e) { next(e); }
  },
  async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await cityService.getCitySuggestions(p(req.params.id)))); } catch (e) { next(e); }
  },
  async listActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cityService.listActivities({ q: qs(req.query.q), category: qs(req.query.category), maxCost: qsNum(req.query.maxCost), cityId: qs(req.query.cityId), page: qsNum(req.query.page, 1), limit: qsNum(req.query.limit, 20) });
      res.json(ok(result.activities, { page: result.page, limit: result.limit, total: result.total }));
    } catch (e) { next(e); }
  },
  async addActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const data = addActivitySchema.parse(req.body);
      const act = await cityService.addActivityToSection(req.user!.userId, p(req.params.tripId), p(req.params.sectionId), data);
      res.status(201).json(ok(act));
    } catch (e) {
      if (e instanceof ZodError) { const fe = e.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message)); }
      next(e);
    }
  },
  async updateActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateActivitySchema.parse(req.body);
      res.json(ok(await cityService.updateSectionActivity(req.user!.userId, p(req.params.tripId), p(req.params.sectionId), p(req.params.actId), data)));
    } catch (e) { next(e); }
  },
  async removeActivity(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await cityService.removeSectionActivity(req.user!.userId, p(req.params.tripId), p(req.params.sectionId), p(req.params.actId)))); } catch (e) { next(e); }
  },
};
