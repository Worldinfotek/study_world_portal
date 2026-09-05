import type { Request, Response } from 'express';
import * as usersService from '../services/users.service.ts';
import { makeCrudController } from '../server/makeCrudController.ts';

const crud = makeCrudController(usersService);

export const list = crud.list;
export const getById = crud.getById;
export const create = crud.create;
export const update = crud.update;
export const remove = crud.remove;

export async function lookup(req: Request, res: Response) {
  res.json(await usersService.lookupUserByEmail(String(req.query.email || '')));
}

export async function save(req: Request, res: Response) {
  res.json(await usersService.save(req.body, req.params.id));
}
