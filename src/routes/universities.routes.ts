import * as universitiesController from '../controllers/universities.controller.ts';
import { makeResourceRouter } from './makeResourceRouter.ts';

export default makeResourceRouter(universitiesController);
