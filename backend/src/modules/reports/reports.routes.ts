import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as controller from './reports.controller';

const router = Router();

router.get('/dashboard/summary', authMiddleware, controller.dashboardSummary);
router.get('/dashboard/cashflow', authMiddleware, controller.cashflow);
router.get('/reports/monthly/:year/:month', authMiddleware, controller.monthlyReport);
router.get('/reports/yearly/:year', authMiddleware, controller.yearlyReport);
router.get('/reports/category/:id', authMiddleware, controller.categoryReport);
router.get('/reports/trends', authMiddleware, controller.trends);

export default router;
