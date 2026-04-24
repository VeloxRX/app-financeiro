import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Request body validation middleware using Zod schemas.
 * Returns 400 with detailed validation errors on failure.
 */
export declare function validate(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Query params validation middleware.
 */
export declare function validateQuery(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map