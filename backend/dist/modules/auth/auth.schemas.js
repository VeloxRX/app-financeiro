"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
    email: zod_1.z.string().email('Email inválido').max(150),
    password: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100),
    currency: zod_1.z.string().length(3).default('BRL'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Senha é obrigatória'),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    currency: zod_1.z.string().length(3).optional(),
    monthly_income: zod_1.z.number().positive().optional(),
    avatar_url: zod_1.z.string().url().optional().nullable(),
});
//# sourceMappingURL=auth.schemas.js.map