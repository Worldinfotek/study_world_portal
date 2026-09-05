import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.ts';
import * as authService from '../services/auth.service.ts';

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body?.email, req.body?.password);
  res.json(result);
}

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.json(result);
}

export async function externalSession(req: Request, res: Response) {
  const result = await authService.createExternalSession(req.body);
  res.json(result);
}

export async function changePassword(req: AuthRequest, res: Response) {
  const result = await authService.changePassword(
    req.portalUser?.email,
    req.body?.currentPassword,
    req.body?.newPassword
  );
  res.json(result);
}
