import { Router } from 'express';
import exampleRoutes from './example.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/example', exampleRoutes);

router.use('/users', userRoutes);

export default router;
