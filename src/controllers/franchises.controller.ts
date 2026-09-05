import * as franchisesService from '../services/franchises.service.ts';
import { makeCrudController } from '../server/makeCrudController.ts';

export const { list, getById, create, update, remove } = makeCrudController(franchisesService);
