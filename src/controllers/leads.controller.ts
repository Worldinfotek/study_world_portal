import * as leadsService from '../services/leads.service.ts';
import { makeCrudController } from '../server/makeCrudController.ts';

export const { list, getById, create, update, remove } = makeCrudController(leadsService, 'leadId');
