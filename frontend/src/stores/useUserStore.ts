import axios from 'axios';
import { create } from 'zustand';

interface User {
    id: number;
    name: string;
}

interface UserState {
    user: User | null;
    setUser: (user: User | null) => void;
    updateUserName: (newName: string) => Promise<string | null>;
}

const API_URL = `http://${window.location.hostname}:4200/api/users`;

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    setUser: (user) => set({ user }),

    updateUserName: async (newName) => {
        const user = get().user;
        if (!user) return 'Пользователь не найден';

        try {
            const response = await axios.put(`${API_URL}/${user.id}`, { name: newName }, { withCredentials: true });
            set({ user: { ...user, name: response.data.name } });
            return null;
        } catch (err: any) {
            return err.response?.data?.error || 'Ошибка при изменении имени';
        }
    },

}));
