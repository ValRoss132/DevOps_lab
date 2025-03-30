import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';

const Auth: React.FC = () => {
    const { login, checkAuth } = useAuthStore();
    const { user } = useUserStore();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nickname: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Проверка авторизации при монтировании
    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
            setIsCheckingAuth(false);
        };
        checkAuthentication();
    }, [checkAuth]);

    // Перенаправление если пользователь авторизован
    useEffect(() => {
        if (user && !isCheckingAuth) {
            navigate('/chat');
        }
    }, [user, isCheckingAuth, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const errorMessage = await login(form.nickname, form.password);

        setIsLoading(false);

        if (errorMessage) {
            setError(errorMessage);
        }
        // navigate('/chat');
        // Навигация после успешного входа будет выполнена во втором useEffect
    };

    return (
        <div>
            <h2 className="text-2xl">Авторизация</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>&#62;</label>
                    <input
                        type="text"
                        name="nickname"
                        placeholder="Nickname"
                        value={form.nickname}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>&#62;</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm mt-2">{error}</div>
                )}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти'}
                </button>

                <div className="text-center text-sm mt-4">
                    Нет аккаунта?{' '}
                    <button type="button" onClick={() => navigate('/register')}>
                        Зарегистрироваться
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Auth;
