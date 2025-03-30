import { Request, Response } from 'express';
import db from '../config/db.config';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, password } = req.body;

        const existingUser = await db.oneOrNone('SELECT * FROM users WHERE name = $1', [name]);
        if (existingUser) {
            return res.status(400).json({ error: 'Никнейм уже занят' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.one(
            'INSERT INTO users (name, password) VALUES ($1, $2) RETURNING id, name',
            [name, hashedPassword]
        );

        req.session.userId = newUser.id;
        return res.status(201).json({ message: 'Регистрация успешна', user: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Ошибка при регистрации' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { name, password } = req.body;

        const user = await db.oneOrNone('SELECT * FROM users WHERE name = $1', [name]);
        if (!user) {
            return res.status(400).json({ error: 'Пользователь не найден' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Неверный пароль' });
        }

        req.session.userId = user.id;
        return res.json({ message: 'Вход выполнен', user: { id: user.id, name: user.name } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Ошибка при входе' });
    }
};

export const logout = (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при выходе' });
        }
        res.json({ message: 'Выход выполнен' });
    });
};

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        // Проверяем, есть ли userId в сессии
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        // Получаем данные пользователя из БД
        const user = await db.oneOrNone(
            'SELECT id, name FROM users WHERE id = $1', 
            [req.session.userId]
        );

        if (!user) {
            // Если пользователь не найден (возможно был удален), очищаем сессию
            req.session.destroy(() => {});
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        return res.json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
    }
};