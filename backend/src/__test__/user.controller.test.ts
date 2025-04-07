import { Request, Response } from 'express';
import { createUserController } from '../controllers/user.controller.factory';

const mockUserModel = {
    create: jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'TestUser', password: 'hashed' }),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn().mockResolvedValue(1),
};

const { createUser, getUser, updateUser, deleteUser } =
    createUserController(mockUserModel);

const mockRequest = (body = {}, params = {}) =>
    ({
        body,
        params,
    }) as unknown as Request;

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res as Response;
};

describe('user controllers testing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser tests', () => {
        test('create a user', async () => {
            const req = mockRequest({ name: 'TestUser', password: 'secret' });
            const res = mockResponse();

            await createUser(req, res);

            expect(mockUserModel.create).toHaveBeenCalledWith(
                'TestUser',
                'secret',
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                id: 1,
                name: 'TestUser',
                password: 'hashed',
            });
        });

        test('Error creating user', async () => {
            mockUserModel.create.mockRejectedValueOnce(new Error('DB error'));

            const req = mockRequest({ name: 'TestUser', password: 'secret' });
            const res = mockResponse();

            await createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'error creating user',
            });
        });
    });

    describe('getUser tests', () => {
        test('return user data with status 200', async () => {
            mockUserModel.getById.mockResolvedValue({
                id: 1,
                name: 'TestUser',
                password: 'hashed',
            });

            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();

            await getUser(req, res);

            expect(mockUserModel.getById).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                id: 1,
                name: 'TestUser',
                password: 'hashed',
            });
        });

        test('user not found', async () => {
            mockUserModel.getById.mockResolvedValue(null);

            const req = mockRequest({}, { id: '2' });
            const res = mockResponse();

            await getUser(req, res);

            expect(mockUserModel.getById).toHaveBeenCalledWith(2);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'user not found' });
        });

        test('return 500 if an error occurs', async () => {
            mockUserModel.getById.mockRejectedValue(new Error('DB Error'));

            const req = mockRequest({ id: '3' });
            const res = mockResponse();

            await getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'error retrieving user data',
            });
        });
    });

    describe('updateUser tests', () => {
        test('update user and return 200', async () => {
            mockUserModel.update.mockResolvedValue({
                id: 1,
                name: 'UpdatedName',
                password: 'hashed',
            });

            const req = mockRequest({ name: 'UpdatedName' }, { id: '1' });
            const res = mockResponse();

            await updateUser(req, res);

            expect(mockUserModel.update).toHaveBeenCalledWith(1, 'UpdatedName');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                id: 1,
                name: 'UpdatedName',
                password: 'hashed',
            });
        });

        test('user not found', async () => {
            mockUserModel.update.mockResolvedValue(null);

            const req = mockRequest({ name: 'UnknownUser' }, { id: '2' });
            const res = mockResponse();

            await updateUser(req, res);

            expect(mockUserModel.update).toHaveBeenCalledWith(2, 'UnknownUser');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'user not found',
            });
        });

        test('return 500 on error', async () => {
            mockUserModel.update.mockRejectedValue(new Error('DB error'));

            const req = mockRequest({ name: 'Crash' }, { id: '3' });
            const res = mockResponse();

            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'error updating user data',
            });
        });
    });

    describe('deleteUser tests', () => {
        test('should delete user and return 204', async () => {
            mockUserModel.delete.mockResolvedValue(1);

            const req = mockRequest({}, { id: '1' });
            const res = mockResponse();

            await deleteUser(req, res);

            expect(mockUserModel.delete).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test('should return 404 if user not found', async () => {
            mockUserModel.delete.mockResolvedValue(0);

            const req = mockRequest({}, { id: '2' });
            const res = mockResponse();

            await deleteUser(req, res);

            expect(mockUserModel.delete).toHaveBeenCalledWith(2);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'user not found' });
        });

        test('should return 500 on error', async () => {
            mockUserModel.delete.mockRejectedValue(new Error('DB error'));

            const req = mockRequest({}, { id: '3' });
            const res = mockResponse();

            await deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'error deleting user data',
            });
        });
    });
});
