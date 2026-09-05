import { Router } from 'express';
import * as usersController from '../controllers/users.controller.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';
import { requireAdmin } from '../middleware/auth.ts';

const router = Router();

router.get('/lookup', asyncHandler(usersController.lookup));
router.get('/', asyncHandler(usersController.list));
router.post('/', asyncHandler(usersController.create));
router.put('/', asyncHandler(usersController.save));
router.get('/:id', asyncHandler(usersController.getById));
router.put('/:id', asyncHandler(usersController.update));
router.patch('/:id', asyncHandler(usersController.update));
router.delete('/:id', requireAdmin, asyncHandler(usersController.remove));

export default router;
