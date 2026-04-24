import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
export declare function dashboardSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function cashflow(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function monthlyReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function yearlyReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function categoryReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function trends(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=reports.controller.d.ts.map