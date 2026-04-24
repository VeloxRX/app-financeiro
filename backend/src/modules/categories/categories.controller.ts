import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './categories.service';
import { AppError } from '../../middleware/errorHandler';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const categories = await service.listCategories(req.userId!);
    res.json(categories);
  } catch (error) { next(error); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const category = await service.createCategory(req.userId!, req.body);
    res.status(201).json(category);
  } catch (error) { next(error); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const category = await service.updateCategory(req.userId!, req.params.id, req.body);
    if (!category) return next(new AppError('Categoria não encontrada', 404));
    res.json(category);
  } catch (error) { next(error); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteCategory(req.userId!, req.params.id);
    res.json({ message: 'Categoria excluída' });
  } catch (error: any) {
    if (error.message === 'SYSTEM_CATEGORY') return next(new AppError('Categorias do sistema não podem ser excluídas', 403));
    next(error);
  }
}
