import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as controller from './transactions.controller';

const router = Router();

router.get('/', authMiddleware, controller.list);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.remove);
router.get('/export', authMiddleware, controller.exportData);

export default router;
