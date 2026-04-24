"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateQuery = validateQuery;
const zod_1 = require("zod");
/**
 * Request body validation middleware using Zod schemas.
 * Returns 400 with detailed validation errors on failure.
 */
function validate(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const messages = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                res.status(400).json({ error: 'Dados inválidos', details: messages });
                return;
            }
            next(error);
        }
    };
}
/**
 * Query params validation middleware.
 */
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const messages = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                res.status(400).json({ error: 'Parâmetros inválidos', details: messages });
                return;
            }
            next(error);
        }
    };
}
//# sourceMappingURL=validate.js.map