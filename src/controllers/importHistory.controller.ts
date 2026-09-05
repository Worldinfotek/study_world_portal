import * as importHistoryService from '../services/importHistory.service.ts';
import { makeCrudController } from '../server/makeCrudController.ts';

export const { list, getById, create, update, remove } = makeCrudController(importHistoryService);
