import type { Request, Response } from 'express';
import * as catalogService from '../services/catalog.service.ts';

export async function bootstrap(_req: Request, res: Response) {
  res.json(await catalogService.getBootstrap());
}

export async function reset(_req: Request, res: Response) {
  res.json(await catalogService.resetCatalog());
}

export async function saveCollection(req: Request, res: Response) {
  res.json(await catalogService.saveRecord(req.params.collection, req.body));
}

export async function deleteCollection(req: Request, res: Response) {
  res.json(await catalogService.deleteRecord(req.params.collection, req.params.id));
}
