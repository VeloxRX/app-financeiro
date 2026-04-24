import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as controller from './categories.controller';

const router = Router();

router.get('/', authMiddleware, controller.list);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.remove);

export default router;
