import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
/**
 * Centralized error handler middleware.
 * Catches all errors and returns a standardized JSON response.
 */
export declare function errorHandler(err: Error | AppError, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map