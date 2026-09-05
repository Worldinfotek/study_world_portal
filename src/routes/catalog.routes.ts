import { Router } from 'express';
import * as catalogController from '../controllers/catalog.controller.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

router.get('/bootstrap', asyncHandler(catalogController.bootstrap));
router.post('/catalog/reset', requireAdmin, asyncHandler(catalogController.reset));
router.put('/records/:collection/:id', asyncHandler(catalogController.saveCollection));
router.delete('/records/:collection/:id', asyncHandler(catalogController.deleteCollection));

export default router;
