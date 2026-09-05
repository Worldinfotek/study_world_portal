import * as franchisesController from '../controllers/franchises.controller.ts';
import { makeResourceRouter } from './makeResourceRouter.ts';

export default makeResourceRouter(franchisesController);
