import * as leadsController from '../controllers/leads.controller.ts';
import { makeResourceRouter } from './makeResourceRouter.ts';

export default makeResourceRouter(leadsController, 'leadId');
