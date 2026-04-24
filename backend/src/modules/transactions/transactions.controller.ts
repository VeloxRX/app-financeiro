import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './transactions.service';
import { AppError } from '../../middleware/errorHandler';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const filters = {
      type: req.query.type as string,
      category_id: req.query.category_id as string,
      from: req.query.from as string,
      to: req.query.to as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    const result = await service.listTransactions(req.userId!, filters);
    res.json(result);
  } catch (error) { next(error); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.createTransaction(req.userId!, req.body);
    res.status(201).json(result);
  } catch (error) { next(error); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.updateTransaction(req.userId!, req.params.id, req.body);
    if (!result) return next(new AppError('Transação não encontrada', 404));
    res.json(result);
  } catch (error) { next(error); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteTransaction(req.userId!, req.params.id);
    res.json({ message: 'Transação excluída' });
  } catch (error) { next(error); }
}

export async function exportData(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const format = (req.query.format as string) || 'csv';
    const data = await service.exportTransactions(req.userId!, {
      format,
      from: req.query.from as string,
      to: req.query.to as string,
      categories: req.query.categories as string,
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transacoes.csv');
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=transacoes.json');
    }
    res.send(data);
  } catch (error) { next(error); }
}
