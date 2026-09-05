import type { NextFunction, Request, Response } from 'express';
import { requireAuth, type AuthRequest } from './auth.ts';

const OPEN_POST = new Set(['/auth/login', '/auth/register', '/auth/external-session']);

export function apiAuthGate(req: Request, res: Response, next: NextFunction) {
  const pathName = req.path;
  const open = pathName === '/health' || (req.method === 'POST' && OPEN_POST.has(pathName));
  if (open) return next();
  return requireAuth(req as AuthRequest, res, next);
}
