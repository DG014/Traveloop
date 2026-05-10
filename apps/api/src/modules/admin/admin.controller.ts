import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { adminService } from './admin.service';
import { ok, err, ErrorCodes } from '../../lib/response';
import { qs, qsNum, p } from '../../lib/qs';

const updateUserSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional(),
});

export const adminController = {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listUsers(qsNum(req.query.page, 1)!, qsNum(req.query.limit, 20)!, qs(req.query.q));
      res.json(ok(result.users, { page: result.page, limit: result.limit, total: result.total }));
    } catch (e) { next(e); }
  },
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateUserSchema.parse(req.body);
      res.json(ok(await adminService.updateUser(req.user!.userId, p(req.params.id), data)));
    } catch (e) {
      if (e instanceof ZodError) { const fe = e.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message)); }
      next(e);
    }
  },
  async getAnalytics(_req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await adminService.getAnalytics())); } catch (e) { next(e); }
  },
  async getPopularCities(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await adminService.getPopularCities(qs(req.query.timeRange) || '30d'))); } catch (e) { next(e); }
  },
  async getPopularActivities(_req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await adminService.getPopularActivities())); } catch (e) { next(e); }
  },
};
