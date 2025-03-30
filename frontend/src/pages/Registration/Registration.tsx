import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Registration: React.FC = () => {
    const { register } = useAuthStore();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nickname: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        const errorMessage = await register(form.nickname, form.password);
        if (errorMessage) {
            setError(errorMessage);
        } else {
            alert('Регистрация успешна!');
            navigate('/auth');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="flex gap-1 ml-0.5">
                &#62;
                <input
                    type="text"
                    name="nickname"
                    placeholder="nickname"
                    value={form.nickname}
                    onChange={handleChange}
                    required
                />
            </label>
            <label className="flex gap-1 ml-0.5">
                &#62;
                <input
                    type="password"
                    name="password"
                    placeholder="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
            </label>
            <label className="flex gap-1 ml-0.5">
                &#62;
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="confirm password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </label>
            {error && <p className="text-red-500">{error}</p>}
            <button
                type="submit"
                className="mt-2 p-2 bg-blue-500 text-white rounded"
            >
                Зарегистрироваться
            </button>
        </form>
    );
};

export default Registration;
