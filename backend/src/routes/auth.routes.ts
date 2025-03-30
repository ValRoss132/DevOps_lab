import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.controller';
import { isAuthenticated } from '../middlewares/auth.middlewares';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/logout', logout);
router.get('/me', isAuthenticated as any,  getCurrentUser as any)

export default router;