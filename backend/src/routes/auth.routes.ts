import { Router } from 'express';
import {
    register,
    login,
    logout,
    getCurrentUser,
} from '../controllers/auth.controller';
import { isAuthenticated } from '../middlewares/auth.middlewares';
import { RequestHandler } from 'express';

const router = Router();

router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.post('/logout', logout);
router.get(
    '/me',
    isAuthenticated as RequestHandler,
    getCurrentUser as RequestHandler,
);

export default router;
