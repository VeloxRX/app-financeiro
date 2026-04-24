import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
}
/**
 * JWT authentication middleware.
 * Extracts and validates JWT from Authorization header.
 */
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map