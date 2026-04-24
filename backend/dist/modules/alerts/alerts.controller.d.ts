import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
export declare function list(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function markRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function markAllRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=alerts.controller.d.ts.map