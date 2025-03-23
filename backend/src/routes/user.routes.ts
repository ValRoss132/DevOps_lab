import { Router } from 'express';
import {
    createUser,
    getUser,
    updateUser,
    deleteUser,
} from '../controllers/user.controller';

const router = Router();

router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
