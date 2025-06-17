import {
    register,
    login,
    logout,
    getCurrentUser,
} from '../controllers/auth.controller';
import { Request, Response } from 'express';
import db from '../config/db.config';
import bcrypt from 'bcryptjs';

jest.mock('../config/db.config');
jest.mock('bcryptjs');

const mockRequest = (body = {}, session = {}) =>
    ({
        body,
        session: {
            userId: undefined,
            destroy: jest.fn((cb) => cb(null)),
            save: jest.fn((cb) => cb(null)),
            ...session,
        },
    }) as unknown as Request;

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
};

describe('auth controllers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register controller tests', () => {
        test('register a new user', async () => {
            const req = mockRequest({ name: 'test', password: '123' });
            const res = mockResponse();

            (db.oneOrNone as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
            (db.one as jest.Mock).mockResolvedValue({ id: 1, name: 'test' });

            await register(req, res);

            expect(db.oneOrNone).toHaveBeenCalled();
            expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Registration successful',
                user: { id: 1, name: 'test' },
            });
        });

        test('should return 400 if the username is already taken', async () => {
            const req = mockRequest({ name: 'existingUser', password: '123' });
            const res = mockResponse();

            (db.oneOrNone as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'existingUser',
            });

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'The nickname is already taken',
            });
        });

        test('error during registration', async () => {
            const req = mockRequest({ name: 'John', password: '123' });
            const res = mockResponse();

            (db.oneOrNone as jest.Mock).mockResolvedValue(null);
            (db.one as jest.Mock).mockRejectedValue(new Error('DB error'));

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Error during registration',
            });
        });
    });

    describe('login controller tests', () => {
        test('log in successfully', async () => {
            const req = mockRequest(
                { name: 'test', password: '123' },
                { save: jest.fn((cb) => cb()) },
            );
            const res = mockResponse();

            const fakeUser = { id: 1, name: 'test', password: 'hashed' };
            (db.oneOrNone as jest.Mock).mockResolvedValue(fakeUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (db.none as jest.Mock).mockResolvedValue(undefined);

            await login(req, res);

            expect(req.session.userId).toBe(1);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Login completed',
                user: { id: 1, name: 'test' },
            });
        });

        test('should return 400 if the user is not found', async () => {
            const req = mockRequest({ name: 'nonexistent', password: '123' });
            const res = mockResponse();

            (db.oneOrNone as jest.Mock).mockResolvedValue(null);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });

        test('should return 400 if the password is incorrect', async () => {
            const req = mockRequest(
                { name: 'testuser', password: 'wrongpassword' },
                { save: jest.fn((cb) => cb()) },
            );
            const res = mockResponse();

            (db.oneOrNone as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'testuser',
                password: 'hashed-password',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Incorrect password',
            });
        });

        test('session save fails', async () => {
            const saveError = new Error('Save failed');
            const req = mockRequest(
                { name: 'test', password: '123' },
                {
                    save: jest.fn((cb) => cb(saveError)),
                },
            );
            const res = mockResponse();

            (db.oneOrNone as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'test',
                password: 'hashed',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (db.none as jest.Mock).mockResolvedValue(undefined);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Session save failed',
            });
        });

        test('internal server error', async () => {
            const req = mockRequest({ name: 'test', password: '123' });
            const res = mockResponse();

            (db.oneOrNone as jest.Mock).mockRejectedValue(
                new Error('DB error'),
            );

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Error logging in',
            });
        });
    });

    describe('Logout controller tests', () => {
        test('Log out successfully', async () => {
            const destroyMock = jest.fn((cb) => cb(null));
            const req = mockRequest({}, { destroy: destroyMock });
            const res = mockResponse();

            await logout(req, res);

            expect(destroyMock).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                message: 'Logout completed',
            });
        });

        test('destroy session failed', async () => {
            const destroyMock = jest.fn((cb) =>
                cb(new Error('Destroy failed')),
            );
            const req = mockRequest({}, { destroy: destroyMock });
            const res = mockResponse();

            await logout(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error logout' });
        });
    });

    describe('getCurrentUser controller tests', () => {
        test('user found', async () => {
            const req = mockRequest({}, { userId: 1 });
            const res = mockResponse();

            const fakeUser = { id: 1, name: 'test' };
            (db.oneOrNone as jest.Mock).mockResolvedValue(fakeUser);

            await getCurrentUser(req, res);

            expect(db.oneOrNone).toHaveBeenCalledWith(
                'SELECT id, name FROM users WHERE id = $1',
                [1],
            );
            expect(res.json).toHaveBeenCalledWith({ user: fakeUser });
        });

        test('unauthorized (no userId in session)', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            await getCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorization' });
        });

        test('user not found', async () => {
            const req = mockRequest({}, { userId: 1 });
            const res = mockResponse();

            (db.oneOrNone as jest.Mock).mockResolvedValue(null);

            await getCurrentUser(req, res);

            expect(req.session.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });

        test('error retrieving user data', async () => {
            const req = mockRequest({}, { userId: 1 });
            const res = mockResponse();

            (db.oneOrNone as jest.Mock).mockRejectedValue(
                new Error('DB error'),
            );

            await getCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Error retrieving user data',
            });
        });
    });
});
