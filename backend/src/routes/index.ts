import { Router } from 'express';
import authRoutes from './authRoutes';
import studentRoutes from './studentRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
