import axios from 'axios';
import { create } from 'zustand';

export interface User {
    id: number;
    name: string;
}

interface UserState {
    user: User | null;
    setUser: (user: User | null) => void;
    updateUserName: (newName: string) => Promise<string | null>;
    deleteUser: () => Promise<string> 
}

const API_URL = `http://${window.location.hostname}:4200/api/users`;

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    setUser: (user) => set({ user }),

    updateUserName: async (newName) => {
        const user = get().user;
        if (!user) return 'User not found';

        try {
            const response = await axios.put<{ name: User['name'] }>(
                `${API_URL}/${user.id}`,
                { name: newName },
                { withCredentials: true },
            );
            set({ user: { ...user, name: response.data.name } });
            return null;
        } catch {
            return 'Save error';
        }
    },

    deleteUser: async () => {
        const user = get().user;
        if (!user) return 'User not found'
        try {
            await axios.delete(`${API_URL}/${user.id}`)
            set({user: null})
            return "User deleted"
        } catch {
            return "Delete user error"
        }
    }
}));
