import { Router } from 'express';
import { getDashboardStats, getAnalytics } from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

export default router;
