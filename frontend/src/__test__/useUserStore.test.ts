import { act } from '@testing-library/react';
import { useUserStore } from '../stores/useUserStore';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useUserStore', () => {
    afterEach(() => {
        jest.clearAllMocks();
        useUserStore.setState({ user: null });
    });

    test('setUser: success', () => {
        const user = { id: 1, name: 'abc' };
        useUserStore.getState().setUser(user);
        expect(useUserStore.getState().user).toEqual(user);
    });

    test('updateUser: resolve', async () => {
        const user = { id: 1, name: 'abc' };
        useUserStore.setState({ user });

        mockedAxios.put.mockResolvedValueOnce({
            data: { name: 'cba' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {
                url: 'http://localhost:4200/api/users/1',
            },
        });

        let result;
        await act(async () => {
            result = await useUserStore.getState().updateUserName('cba');
        });

        expect(mockedAxios.put).toHaveBeenCalledWith(
            'http://localhost:4200/api/users/1',
            { name: 'cba' },
            { withCredentials: true },
        );
        expect(result).toBeNull();
        expect(useUserStore.getState().user?.name).toBe('cba');
    });

    test('updateUser: user not found', async () => {
        useUserStore.setState({ user: null });

        let result;
        await act(async () => {
            result = await useUserStore.getState().updateUserName('any');
        });

        expect(result).toBe('User not found');
    });

    test('updateUser: reject', async () => {
        const user = { id: 1, name: 'abc' };
        useUserStore.setState({ user });

        mockedAxios.put.mockRejectedValueOnce(new Error('Server error'));

        let result;
        await act(async () => {
            result = await useUserStore.getState().updateUserName('cba');
        });

        expect(mockedAxios.put).toHaveBeenCalledWith(
            'http://localhost:4200/api/users/1',
            { name: 'cba' },
            { withCredentials: true },
        );
        expect(useUserStore.getState().user?.name).toBe('abc')
        expect(result).toBe('Save error')
    });
});
