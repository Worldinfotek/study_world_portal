import * as countriesController from '../controllers/countries.controller.ts';
import { makeResourceRouter } from './makeResourceRouter.ts';

export default makeResourceRouter(countriesController, 'code');
