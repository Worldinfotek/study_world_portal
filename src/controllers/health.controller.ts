import type { Request, Response } from 'express';
import * as healthService from '../services/health.service.ts';

export async function health(_req: Request, res: Response) {
  const payload = await healthService.getHealth();
  res.status(payload.status === 'ok' ? 200 : 500).json(payload);
}

export async function databaseStatus(_req: Request, res: Response) {
  res.json(await healthService.getDatabaseStatus());
}
