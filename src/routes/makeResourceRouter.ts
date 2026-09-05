import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.ts';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function makeResourceRouter(
  controller: {
    list: Handler;
    getById: Handler;
    create: Handler;
    update: Handler;
    remove: Handler;
  },
  idParam = 'id'
) {
  const router = Router();
  router.get('/', asyncHandler(controller.list));
  router.post('/', asyncHandler(controller.create));
  router.get(`/:${idParam}`, asyncHandler(controller.getById));
  router.put(`/:${idParam}`, asyncHandler(controller.update));
  router.patch(`/:${idParam}`, asyncHandler(controller.update));
  router.delete(`/:${idParam}`, asyncHandler(controller.remove));
  return router;
}
