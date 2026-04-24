import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './goals.service';
import { AppError } from '../../middleware/errorHandler';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const goals = await service.listGoals(req.userId!);
    res.json(goals);
  } catch (error) { next(error); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const goal = await service.createGoal(req.userId!, req.body);
    res.status(201).json(goal);
  } catch (error) { next(error); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const goal = await service.updateGoal(req.userId!, req.params.id, req.body);
    if (!goal) return next(new AppError('Meta não encontrada', 404));
    res.json(goal);
  } catch (error) { next(error); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteGoal(req.userId!, req.params.id);
    res.json({ message: 'Meta excluída' });
  } catch (error) { next(error); }
}

export async function deposit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return next(new AppError('Valor inválido', 400));
    const goal = await service.depositToGoal(req.userId!, req.params.id, amount);
    if (!goal) return next(new AppError('Meta não encontrada', 404));
    res.json(goal);
  } catch (error) { next(error); }
}
