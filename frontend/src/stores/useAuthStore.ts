import { create } from 'zustand';
import axios from 'axios';
import { useUserStore } from './useUserStore';
import { User } from './useUserStore';

interface AuthState {
    register: (name: string, password: string) => Promise<string | null>;
    login: (name: string, password: string) => Promise<string | null>;
    logout: () => Promise<string | null>;
    checkAuth: () => Promise<boolean>;
}

const API_URL = `http://${window.location.hostname}:4200/api/`;

export const useAuthStore = create<AuthState>(() => ({
    register: async (name, password) => {
        try {
            await axios.post(
                `${API_URL}auth/register`,
                { name, password },
                { withCredentials: true },
            );
            return null;
        } catch {
            return 'Registration error';
        }
    },

    login: async (name, password) => {
        try {
            const res = await axios.post<{ user: User }>(
                `${API_URL}auth/login`,
                { name, password },
                { withCredentials: true },
            );
            useUserStore.getState().setUser(res.data.user);
            return null;
        } catch {
            return 'Login error';
        }
    },

    logout: async () => {
        try {
            await axios.post(
                `${API_URL}auth/logout`,
                {},
                { withCredentials: true },
            );
            return null;
        } catch {
            return 'Logout error';
        }
    },

    checkAuth: async () => {
        try {
            const res = await axios.get<{ user: User }>(`${API_URL}auth/me`, {
                withCredentials: true,
            });
            useUserStore.getState().setUser(res.data.user);
            return true
        } catch {
            useUserStore.getState().setUser(null);
            return false
        }
    },
}));
