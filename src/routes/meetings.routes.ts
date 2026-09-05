import * as meetingsController from '../controllers/meetings.controller.ts';
import { makeResourceRouter } from './makeResourceRouter.ts';

export default makeResourceRouter(meetingsController);
