import * as coursesController from '../controllers/courses.controller.ts';
import { makeResourceRouter } from './makeResourceRouter.ts';

export default makeResourceRouter(coursesController);
