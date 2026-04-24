import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
export declare function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function resetPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function refreshToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map