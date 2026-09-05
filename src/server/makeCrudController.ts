import type { Request, Response } from 'express';

type CrudService = {
  list: () => Promise<unknown>;
  getById: (id: string) => Promise<unknown>;
  save: (body: any, id?: string) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
};

export function makeCrudController(service: CrudService, idParam = 'id') {
  return {
    list: async (_req: Request, res: Response) => {
      res.json(await service.list());
    },
    getById: async (req: Request, res: Response) => {
      res.json(await service.getById(String(req.params[idParam] || '')));
    },
    create: async (req: Request, res: Response) => {
      res.status(201).json(await service.save(req.body));
    },
    update: async (req: Request, res: Response) => {
      res.json(await service.save(req.body, String(req.params[idParam] || '')));
    },
    remove: async (req: Request, res: Response) => {
      res.json(await service.remove(String(req.params[idParam] || '')));
    },
  };
}
