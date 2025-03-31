import { Request, Response } from 'express';
import db from '../config/db.config';
import userModel from '../models/user.model';

const User = userModel(db)

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, password } = req.body;
        const user = await User.create(name, password);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при создании пользователя' });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await User.getById(parseInt(req.params.id));
        if (!user) res.status(404).json({ error: 'Пользователь не найден' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            error: 'Ошибка при получении данных пользователя',
        });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { name, password } = req.body;
        const user = await User.update(
            parseInt(req.params.id),
            name,
        );
        if (!user) res.status(404).json({ error: 'Пользователь не найден' });
        res.status(200).json(user);
    } catch {
        res.status(500).json({
            error: 'Ошибка при обновлении данных пользователя',
        });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const result = await User.delete(parseInt(req.params.id));
        if (result === 0)
            res.status(404).json({ error: 'Пользователь не найден' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении пользователя' });
    }
};
