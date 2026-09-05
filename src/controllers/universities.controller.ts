import * as universitiesService from '../services/universities.service.ts';
import { makeCrudController } from '../server/makeCrudController.ts';

export const { list, getById, create, update, remove } = makeCrudController(universitiesService);
