import { Request, Response } from 'express';
import userModel from '../models/user.model';

type UserModelType = ReturnType<typeof userModel>;

export const createUserController = (User: UserModelType) => ({
    createUser: async (req: Request, res: Response) => {
        try {
            const { name, password } = req.body;
            const user = await User.create(name, password);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: 'error creating user' });
        }
    },

    getUser: async (req: Request, res: Response) => {
        try {
            const user = await User.getById(parseInt(req.params.id));
            if (!user) res.status(404).json({ error: 'user not found' });
            res.status(200).json(user);
        } catch {
            res.status(500).json({
                error: 'error retrieving user data',
            });
        }
    },

    updateUser: async (req: Request, res: Response) => {
        try {
            const { name } = req.body;
            const user = await User.update(parseInt(req.params.id), name);
            if (!user) res.status(404).json({ error: 'user not found' });
            res.status(200).json(user);
        } catch {
            res.status(500).json({
                error: 'error updating user data',
            });
        }
    },

    deleteUser: async (req: Request, res: Response) => {
        try {
            const result = await User.delete(parseInt(req.params.id));
            if (result === 0)
                res.status(404).json({ error: 'user not found' });
            res.status(204).send();
        } catch {
            res.status(500).json({ error: 'error deleting user data' });
        }
    },
})



