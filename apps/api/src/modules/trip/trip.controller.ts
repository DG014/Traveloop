import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { tripService, createTripSchema, updateTripSchema } from './trip.service';
import { sectionService, createSectionSchema, updateSectionSchema } from './section.service';
import { ok, err, ErrorCodes } from '../../lib/response';
import { qs, qsNum, p } from '../../lib/qs';

export const tripController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tripService.listTrips(req.user!.userId, qs(req.query.status), qsNum(req.query.page, 1)!, qsNum(req.query.limit, 20)!);
      res.json(ok(result.trips, { page: result.page, limit: result.limit, total: result.total }));
    } catch (error) { next(error); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTripSchema.parse(req.body);
      const trip = await tripService.createTrip(req.user!.userId, data);
      res.status(201).json(ok(trip));
    } catch (error) {
      if (error instanceof ZodError) { const fe = error.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message, fe.path[0] as string)); }
      next(error);
    }
  },
  async getOne(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await tripService.getTrip(req.user!.userId, p(req.params.id)))); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateTripSchema.parse(req.body);
      res.json(ok(await tripService.updateTrip(req.user!.userId, p(req.params.id), data)));
    } catch (error) {
      if (error instanceof ZodError) { const fe = error.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message, fe.path[0] as string)); }
      next(error);
    }
  },
  async softDelete(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await tripService.softDeleteTrip(req.user!.userId, p(req.params.id)))); } catch (e) { next(e); }
  },
  async getItinerary(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await tripService.getItinerary(req.user!.userId, p(req.params.id)))); } catch (e) { next(e); }
  },
  async copyTrip(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(ok(await tripService.copyTrip(req.user!.userId, p(req.params.slug)))); } catch (e) { next(e); }
  },
  async publish(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await tripService.publishTrip(req.user!.userId, p(req.params.id)))); } catch (e) { next(e); }
  },
  async unpublish(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await tripService.unpublishTrip(req.user!.userId, p(req.params.id)))); } catch (e) { next(e); }
  },
  async listSections(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await sectionService.listSections(req.user!.userId, p(req.params.tripId)))); } catch (e) { next(e); }
  },
  async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSectionSchema.parse(req.body);
      res.status(201).json(ok(await sectionService.createSection(req.user!.userId, p(req.params.tripId), data)));
    } catch (error) {
      if (error instanceof ZodError) { const fe = error.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message, fe.path[0] as string)); }
      next(error);
    }
  },
  async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateSectionSchema.parse(req.body);
      res.json(ok(await sectionService.updateSection(req.user!.userId, p(req.params.tripId), p(req.params.id), data)));
    } catch (error) {
      if (error instanceof ZodError) { const fe = error.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message, fe.path[0] as string)); }
      next(error);
    }
  },
  async deleteSection(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await sectionService.deleteSection(req.user!.userId, p(req.params.tripId), p(req.params.id)))); } catch (e) { next(e); }
  },
};
