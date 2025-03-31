import { create } from 'zustand';
import axios from 'axios';
import { useUserStore } from './useUserStore';

interface AuthState {
    register: (name: string, password: string) => Promise<string | null>;
    login: (name: string, password: string) => Promise<string | null>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const API_URL = `http://${window.location.hostname}:4200/api/`;

export const useAuthStore = create<AuthState>(() => ({
    register: async (name, password) => {
        try {
            await axios.post(
                `${API_URL}auth/register`,
                { name, password },
                { withCredentials: true }
            );
            return null;
        } catch (err: any) {
            return err.response?.data?.error || 'Ошибка регистрации';
        }
    },

    login: async (name, password) => {
        try {
            const res = await axios.post(
                `${API_URL}auth/login`,
                { name, password },
                { withCredentials: true }
            );
            useUserStore.getState().setUser(res.data.user)
            return null;
        } catch (err: any) {
            return err.response?.data?.error || 'Ошибка входа';
        }
    },

    logout: async () => {
        try {
            await axios.post(`${API_URL}auth/logout`, {}, { withCredentials: true });

        } catch (err) {
            console.error('Ошибка при выходе', err);
        }
    },

    checkAuth: async () => {
        try {
            const res = await axios.get(`${API_URL}auth/me`, { withCredentials: true });
            useUserStore.getState().setUser(res.data.user)
        } catch {
            useUserStore.getState().setUser(null)
        }
    },
}));
