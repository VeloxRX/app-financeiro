import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
export declare function list(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function deposit(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=goals.controller.d.ts.map