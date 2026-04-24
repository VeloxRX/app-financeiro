import { Router } from 'express';
import * as controller from './auth.controller';
import { authMiddleware } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimit';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema, updateProfileSchema } from './auth.schemas';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/logout', authMiddleware, controller.logout);
router.get('/profile', authMiddleware, controller.getProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), controller.updateProfile);
router.post('/reset-pass', authLimiter, controller.resetPassword);
router.post('/refresh', controller.refreshToken);

export default router;
