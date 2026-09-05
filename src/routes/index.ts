import { Router } from 'express';
import authRoutes from './auth.routes.ts';
import usersRoutes from './users.routes.ts';
import catalogRoutes from './catalog.routes.ts';
import leadsRoutes from './leads.routes.ts';
import healthRoutes from './health.routes.ts';
import universitiesRoutes from './universities.routes.ts';
import coursesRoutes from './courses.routes.ts';
import countriesRoutes from './countries.routes.ts';
import franchisesRoutes from './franchises.routes.ts';
import programsRoutes from './programs.routes.ts';
import importHistoryRoutes from './importHistory.routes.ts';
import meetingsRoutes from './meetings.routes.ts';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/leads', leadsRoutes);
router.use('/universities', universitiesRoutes);
router.use('/courses', coursesRoutes);
router.use('/countries', countriesRoutes);
router.use('/franchises', franchisesRoutes);
router.use('/programs', programsRoutes);
router.use('/import-history', importHistoryRoutes);
router.use('/meetings', meetingsRoutes);
router.use(catalogRoutes);

export default router;
