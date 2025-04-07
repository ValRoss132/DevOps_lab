import userModel, { User } from '../models/user.model';
import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';

const mockDb = {
    one: jest.fn(),
    result: jest.fn(),
} as unknown as IDatabase<{ users: User } | IClient>;

const model = userModel(mockDb);

describe('', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('create should insert and return user', async () => {
        const mockUser = { id: 1, name: 'Alice', password: 'secret' };
        mockDb.one = jest.fn().mockResolvedValue(mockUser);

        const result = await model.create('Alice', 'secret');

        expect(mockDb.one).toHaveBeenCalledWith(
            'INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *',
            ['Alice', 'secret']
        );
        expect(result).toEqual(mockUser);
    });

    test('getById should return user by id', async () => {
        const mockUser = { id: 2, name: 'Bob', password: 'pass' };
        mockDb.one = jest.fn().mockResolvedValue(mockUser);

        const result = await model.getById(2);

        expect(mockDb.one).toHaveBeenCalledWith(
            'SELECT * FROM users WHERE id = $1',
            [2]
        );
        expect(result).toEqual(mockUser);
    });

    test('update should update and return user', async () => {
        const updatedUser = { id: 3, name: 'Charlie', password: 'unchanged' };
        mockDb.one = jest.fn().mockResolvedValue(updatedUser);

        const result = await model.update(3, 'Charlie');

        expect(mockDb.one).toHaveBeenCalledWith(
            'UPDATE users SET name = $2 WHERE id = $1 RETURNING *',
            [3, 'Charlie']
        );
        expect(result).toEqual(updatedUser);
    });

    test('delete should delete user and return row count', async () => {
        mockDb.result = jest.fn().mockResolvedValue(1);

        const result = await model.delete(4);

        expect(mockDb.result).toHaveBeenCalledWith(
            'DELETE FROM users WHERE id = $1',
            [4],
            expect.any(Function)
        );
        expect(result).toBe(1);
    });
})