import React, { useEffect, useState, useRef } from 'react';

import Loader from '../../components/Loader/Loader';

import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
// import { useUserStore } from '../../stores/useUserStore';

interface TerminalLine {
    type: 'input' | 'output' | 'error';
    content: string;
    isPassword?: boolean;
    withLoader?: boolean;
}

const Auth: React.FC = () => {
    const { login, checkAuth } = useAuthStore();
    // const { user } = useUserStore();
    const navigate = useNavigate();
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    // Проверка авторизации при монтировании
    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
            setIsCheckingAuth(false);
        };
        checkAuthentication();
    }, [checkAuth]);

    // Перенаправление если пользователь авторизован
    // useEffect(() => {
    //     if (user && !isCheckingAuth) {
    //         navigate('/chat');
    //     }
    // }, [user, isCheckingAuth, navigate]);

    // Фокус на инпут при изменении
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [lines]);

    // Скролл вниз при добавлении новых строк
    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [lines]);

    // Начальное приглашение
    useEffect(() => {
        if (!isCheckingAuth && lines.length === 0) {
            setLines([
                {
                    type: 'output',
                    content: 'Enter your nickname:',
                },
            ]);
        }
    }, [isCheckingAuth, lines.length]);

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const currentLine = lines[lines.length - 1];

            if (currentLine && currentLine.content === 'Enter your nickname:') {
                // Обработка никнейма
                setLines((prev) => [
                    ...prev,
                    { type: 'input', content: currentInput },
                    { type: 'output', content: 'Enter your password:' },
                ]);
                setCurrentInput('');
                setIsLoading(true);

                // Здесь можно добавить проверку никнейма
                // Для примера просто продолжаем
                setIsLoading(false);
            } else if (
                currentLine &&
                currentLine.content === 'Enter your password:'
            ) {
                // Обработка пароля
                setLines((prev) => [
                    ...prev,
                    { type: 'input', content: currentInput },
                    { type: 'output', content: 'Access granted!' },
                ]);
                setCurrentInput('');
            } else if (currentLine?.content === 'Enter your password:') {
                // Обработка пароля
                setLines((prev) => [
                    ...prev,
                    {
                        type: 'input',
                        content: '',
                        isPassword: true,
                    },
                ]);
                setCurrentInput('');
                setIsLoading(true);

                // Находим введенный никнейм (предпоследняя строка перед паролем)
                const nicknameLine = lines[lines.length - 2];
                const nickname =
                    nicknameLine.type === 'input' ? nicknameLine.content : '';

                const errorMessage = await login(nickname, currentInput);
                setIsLoading(false);

                if (errorMessage) {
                    setLines((prev) => [
                        ...prev,
                        { type: 'error', content: errorMessage },
                        { type: 'output', content: 'Enter your nickname:' },
                    ]);
                } else {
                    setLines((prev) => [
                        ...prev,
                        {
                            type: 'output',
                            content: 'Login successful! Redirecting to chat',
                            withLoader: true,
                        },
                    ]);
                    await checkAuth();
                    setTimeout(() => {
                        navigate('/chat');
                    }, 5000);
                }
            } else if (currentLine && currentLine.type === 'error') {
                // После ошибки снова запрашиваем никнейм
                setLines((prev) => [
                    ...prev,
                    { type: 'output', content: 'Enter your nickname:' },
                ]);
                setCurrentInput('');
            } else if (!currentLine) {
                console.warn('No current line to process.');
            }

            console.log('Updated lines:', lines);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentInput(e.target.value);
    };

    return (
        <div className="p-1 text-m terminal-container">
            <div className="flex items-center mb-4 gap-2">
                <span>Authorization</span>
                <span>{' | '}</span>
                <button
                    onClick={() => navigate('/register')}
                    className="text-white hover:underline"
                >
                    register
                </button>
            </div>

            <div className="primary-container overflow-hidden flex">
                <div className="flex-1 overflow-y-auto flex flex-col">
                    {lines.map((line, index) => (
                        <div
                            key={index}
                            className={`flex ${line.type === 'error' ? 'text-red-300' : 'text-white'}`}
                        >
                            <span className="mr-2">{'~ $'}&nbsp;</span>
                            {line.type === 'input' && line.isPassword ? (
                                <span className="text-white"></span>
                            ) : (
                                <>
                                    <span>{line.content}&nbsp;</span>
                                    {line.withLoader && (
                                        <Loader active={true} speed={100} />
                                    )}
                                </>
                            )}
                        </div>
                    ))}

                    {(lines.length === 0 ||
                        lines[lines.length - 1].type !== 'error') && (
                        <div className="flex">
                            <span className="text-white mr-2">{'>'}&nbsp;</span>
                            <input
                                ref={inputRef}
                                type={
                                    lines[lines.length - 1]?.content ===
                                    'Enter your password:'
                                        ? 'password'
                                        : 'text'
                                }
                                value={currentInput}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                className={`text-white bg-transparent border-none focus:outline-none flex-1 ${
                                    lines[lines.length - 1]?.content ===
                                    'Enter your password:'
                                        ? 'opacity-0'
                                        : ''
                                }`}
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {isLoading && <Loader active={true} speed={100} />}

                    <div ref={endRef} />
                </div>
            </div>
        </div>
    );
};

export default Auth;
