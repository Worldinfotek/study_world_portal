import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../server/httpError.ts';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const error = err as { status?: number; message?: string };
  const status = err instanceof HttpError ? err.status : Number(error?.status) || 500;
  if (status >= 500) {
    console.error('[API]', err);
  }
  res.status(status).json({
    error: error?.message || 'Server error',
  });
}
