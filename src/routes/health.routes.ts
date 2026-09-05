import { Router } from 'express';
import * as healthController from '../controllers/health.controller.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

const router = Router();

router.get('/health', asyncHandler(healthController.health));
router.get('/cloudsql/status', asyncHandler(healthController.databaseStatus));

export default router;
