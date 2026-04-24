import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(150),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100),
  currency: z.string().length(3).default('BRL'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  currency: z.string().length(3).optional(),
  monthly_income: z.number().positive().optional(),
  avatar_url: z.string().url().optional().nullable(),
});
