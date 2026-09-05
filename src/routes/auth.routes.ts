import { Router } from 'express';
import * as authController from '../controllers/auth.controller.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

const router = Router();

router.post('/login', asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));
router.post('/external-session', asyncHandler(authController.externalSession));
router.post('/change-password', asyncHandler(authController.changePassword));

export default router;
