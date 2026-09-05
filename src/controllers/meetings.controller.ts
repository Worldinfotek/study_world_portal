import * as meetingsService from '../services/meetings.service.ts';
import { makeCrudController } from '../server/makeCrudController.ts';

export const { list, getById, create, update, remove } = makeCrudController(meetingsService);
