import { Router } from 'express';
import db from '../config/db.config';
import userModel from '../models/user.model';
import { createUserController } from '../controllers/user.controller.factory';

const User = userModel(db);
export const {
    createUser,
    getUser,
    updateUser,
    deleteUser,
} = createUserController(User);

const router = Router();

router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
