import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './reports.service';

export async function dashboardSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const summary = await service.getDashboardSummary(req.userId!);
    res.json(summary);
  } catch (error) { next(error); }
}

export async function cashflow(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.getCashflow(req.userId!);
    res.json(data);
  } catch (error) { next(error); }
}

export async function monthlyReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { year, month } = req.params;
    const report = await service.getMonthlyReport(req.userId!, parseInt(year), parseInt(month));
    res.json(report);
  } catch (error) { next(error); }
}

export async function yearlyReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { year } = req.params;
    const report = await service.getYearlyReport(req.userId!, parseInt(year));
    res.json(report);
  } catch (error) { next(error); }
}

export async function categoryReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const report = await service.getCategoryReport(req.userId!, req.params.id);
    res.json(report);
  } catch (error) { next(error); }
}

export async function trends(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.getTrends(req.userId!);
    res.json(data);
  } catch (error) { next(error); }
}
