import { act } from '@testing-library/react';
import { useAuthStore } from '../stores/useAuthStore';
import axios from 'axios';
import { useUserStore } from '../stores/useUserStore';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../stores/useUserStore');

const URL = 'http://localhost:4200/api';

const mockResponse = (status: number, url: string, user = {}) => {
    return {
        data: {
            user: user,
        },
        status: status,
        statusText: 'none',
        headers: {},
        config: { url: `${URL}${url}` },
    };
};

describe('тестирование useAuthStore', () => {
    const mockUser = { id: 1, name: 'abc' };
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Registration tests
    // =================

    test('Registration: resolve', async () => {
        mockedAxios.post.mockResolvedValueOnce(
            mockResponse(200, '/auth/register'),
        );

        let result;
        await act(async () => {
            result = await useAuthStore.getState().register('abc', '123');
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${URL}/auth/register`,
            { name: 'abc', password: '123' },
            { withCredentials: true },
        );
        expect(result).toBeNull();
    });

    test('Registration: reject', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Server error'));

        let result;
        await act(async () => {
            result = await useAuthStore.getState().register('abc', '123');
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${URL}/auth/register`,
            { name: 'abc', password: '123' },
            { withCredentials: true },
        );
        expect(result).toBe('Registration error');
    });

    // Login tests
    // =================

    test('Login: resolve', async () => {
        mockedAxios.post.mockResolvedValueOnce(
            mockResponse(200, '/auth/login', mockUser),
        );

        const setUser = jest.fn();
        (useUserStore.getState as jest.Mock).mockReturnValue({ setUser });

        let result;
        await act(async () => {
            result = await useAuthStore.getState().login('abc', '123');
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${URL}/auth/login`,
            { name: 'abc', password: '123' },
            { withCredentials: true },
        );
        expect(setUser).toHaveBeenCalledWith(mockUser);
        expect(result).toBeNull();
    });

    test('Login: reject', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Server error'));

        const setUser = jest.fn();
        (useUserStore.getState as jest.Mock).mockReturnValue({
            user: null,
            setUser,
        });

        let result;
        await act(async () => {
            result = await useAuthStore.getState().login('abc', '123');
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${URL}/auth/login`,
            { name: 'abc', password: '123' },
            { withCredentials: true },
        );
        expect(result).toBe('Login error');
        const user = useUserStore.getState().user;
        expect(user).toBeNull();
    });

    // Logout tests
    // =================

    test('Logout: resolve', async () => {
        mockedAxios.post.mockResolvedValueOnce(
            mockResponse(200, '/auth/logout'),
        );

        let result;
        await act(async () => {
            result = await useAuthStore.getState().logout();
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${URL}/auth/logout`,
            {},
            { withCredentials: true },
        );
        expect(result).toBeNull();
    });

    test('Logout: reject', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Ошибка сервера'));

        let result;
        await act(async () => {
            result = await useAuthStore.getState().logout();
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${URL}/auth/logout`,
            {},
            { withCredentials: true },
        );
        expect(result).toBe('Logout error');
    });

    // Check Auth tests
    // =================

    test('CheckAuth: resolve', async () => {
        mockedAxios.get.mockResolvedValueOnce(
            mockResponse(200, '/auth/me', mockUser),
        );

        const setUser = jest.fn();
        (useUserStore.getState as jest.Mock).mockReturnValue({setUser});

        let result;
        await act(async () => {
            result = await useAuthStore.getState().checkAuth();
        });

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${URL}/auth/me`,
            { withCredentials: true },
        );
        expect(setUser).toHaveBeenCalledWith(mockUser)
        expect(result).toBe(true);
    });

    test('CheckAuth: reject', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

        const setUser = jest.fn();
        (useUserStore.getState as jest.Mock).mockReturnValue({setUser});

        let result;
        await act(async () => {
            result = await useAuthStore.getState().checkAuth();
        });

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${URL}/auth/me`,
            { withCredentials: true },
        );
        expect(setUser).toHaveBeenCalledWith(null)
        expect(result).toBe(false);
    });
});
