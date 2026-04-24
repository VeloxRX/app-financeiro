import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as authService from './auth.service';
import { AppError } from '../../middleware/errorHandler';

export async function register(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'EMAIL_EXISTS') {
      return next(new AppError('Este email já está cadastrado', 409));
    }
    next(error);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return next(new AppError('Email ou senha incorretos', 401));
    }
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.userId!);
    if (!user) return next(new AppError('Usuário não encontrado', 404));
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.updateProfile(req.userId!, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.resetPassword(req.body.email);
    res.json({ message: 'Se o email existir, enviaremos instruções de recuperação' });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return next(new AppError('Refresh token é obrigatório', 400));
    const result = await authService.refreshToken(refresh_token);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'INVALID_REFRESH_TOKEN') {
      return next(new AppError('Refresh token inválido ou expirado', 401));
    }
    next(error);
  }
}
