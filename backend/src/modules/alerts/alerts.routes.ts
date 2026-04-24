import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as controller from './alerts.controller';

const router = Router();

router.get('/', authMiddleware, controller.list);
router.put('/:id/read', authMiddleware, controller.markRead);
router.put('/read-all', authMiddleware, controller.markAllRead);
router.delete('/:id', authMiddleware, controller.remove);

export default router;
