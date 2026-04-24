import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './alerts.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unread === 'true';
    const result = await service.listAlerts(req.userId!, page, limit, unreadOnly);
    res.json(result);
  } catch (error) { next(error); }
}

export async function markRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.markAsRead(req.userId!, req.params.id);
    res.json({ message: 'Alerta marcado como lido' });
  } catch (error) { next(error); }
}

export async function markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.markAllAsRead(req.userId!);
    res.json({ message: 'Todos os alertas marcados como lidos' });
  } catch (error) { next(error); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteAlert(req.userId!, req.params.id);
    res.json({ message: 'Alerta excluído' });
  } catch (error) { next(error); }
}
