import { Request, Response, NextFunction } from 'express';
import { communityService } from './community.service';
import { ok } from '../../lib/response';
import { qs, qsNum } from '../../lib/qs';

export const communityController = {
  async listPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await communityService.listPosts(qsNum(req.query.page, 1)!, qsNum(req.query.limit, 10)!);
      res.json(ok(result.posts, { page: result.page, limit: result.limit, total: result.total }));
    } catch (e) { next(e); }
  },
  async getPublicTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = qs(req.headers['x-session-id']) || req.ip || 'anonymous';
      const result = await communityService.getPublicTrip(req.params.slug as string, sessionId);
      res.json(ok(result));
    } catch (e) { next(e); }
  },
};
