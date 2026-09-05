import * as programsController from '../controllers/programs.controller.ts';
import { makeResourceRouter } from './makeResourceRouter.ts';

export default makeResourceRouter(programsController);
