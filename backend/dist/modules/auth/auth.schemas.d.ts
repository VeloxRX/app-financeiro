import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    name: string;
    currency: string;
}, {
    password: string;
    email: string;
    name: string;
    currency?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    monthly_income: z.ZodOptional<z.ZodNumber>;
    avatar_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    currency?: string | undefined;
    monthly_income?: number | undefined;
    avatar_url?: string | null | undefined;
}, {
    name?: string | undefined;
    currency?: string | undefined;
    monthly_income?: number | undefined;
    avatar_url?: string | null | undefined;
}>;
//# sourceMappingURL=auth.schemas.d.ts.map