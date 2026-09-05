import * as programsService from '../services/programs.service.ts';
import { makeCrudController } from '../server/makeCrudController.ts';

export const { list, getById, create, update, remove } = makeCrudController(programsService);
