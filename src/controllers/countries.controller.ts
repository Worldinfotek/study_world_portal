import * as countriesService from '../services/countries.service.ts';
import { makeCrudController } from '../server/makeCrudController.ts';

export const { list, getById, create, update, remove } = makeCrudController(countriesService, 'code');
