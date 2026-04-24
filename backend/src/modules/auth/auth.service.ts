import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import * as authRepo from './auth.repository';
import * as transactionsService from '../transactions/transactions.service';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  currency?: string;
}

interface AuthResponse {
  user: { id: string; name: string; email: string; currency: string };
  access_token: string;
  refresh_token: string;
}

function generateTokens(userId: string) {
  const access_token = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '15m' });
  const refresh_token = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { access_token, refresh_token };
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const existing = await authRepo.findByEmail(input.email);
  if (existing) throw new Error('EMAIL_EXISTS');

  const password_hash = await bcrypt.hash(input.password, 12);
  const user = await authRepo.create({
    name: input.name,
    email: input.email,
    password_hash,
    currency: input.currency || 'BRL',
  });

  const tokens = generateTokens(user.id);
  return {
    user: { id: user.id, name: user.name, email: user.email, currency: user.currency },
    ...tokens,
  };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const user = await authRepo.findByEmail(email);
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const tokens = generateTokens(user.id);
  return {
    user: { id: user.id, name: user.name, email: user.email, currency: user.currency },
    ...tokens,
  };
}

export async function getProfile(userId: string) {
  const user = await authRepo.findById(userId);
  if (!user) return null;
  const { password_hash, ...profile } = user;
  
  // Trigger generation of monthly recurring transactions seamlessly
  transactionsService.generateMonthlyRecurring(userId).catch(err => 
    console.error('Failed to generate recurring transactions:', err)
  );
  
  return profile;
}

export async function updateProfile(userId: string, data: Partial<RegisterInput & { monthly_income: number; avatar_url: string }>): Promise<any> {
  return authRepo.update(userId, data);
}

export async function resetPassword(email: string): Promise<void> {
  const user = await authRepo.findByEmail(email);
  if (!user) return; // Silent fail for security
  // In production: send email with reset link
  console.log(`[SMTP] Password reset requested for ${email}`);
}

export async function refreshToken(token: string): Promise<{ access_token: string; refresh_token: string }> {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    return generateTokens(payload.userId);
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }
}
