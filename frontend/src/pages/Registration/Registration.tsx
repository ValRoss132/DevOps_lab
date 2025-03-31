import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';

interface TerminalLine {
    type: 'input' | 'output' | 'error' | 'loading';
    content: string;
    isPassword?: boolean;
    withLoader?: boolean;
}

const Registration: React.FC = () => {
    const { register } = useAuthStore();
    const navigate = useNavigate();
    const [lines, setLines] = useState<TerminalLine[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLines([{ type: 'output', content: 'Enter a nickname:' }]);
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, [lines]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const lastLine = lines[lines.length - 1];

            if (lastLine.content === 'Enter a nickname:') {
                setNickname(currentInput);
                setLines((prev) => [
                    ...prev,
                    { type: 'input', content: currentInput },
                    { type: 'output', content: 'Enter a password:' },
                ]);
                setCurrentInput('');
            } else if (lastLine.content === 'Enter a password:') {
                setPassword(currentInput);
                setLines((prev) => [
                    ...prev,
                    { type: 'input', content: '', isPassword: true },
                    { type: 'output', content: 'Confirm password:' },
                ]);
                setCurrentInput('');
            } else if (lastLine.content === 'Confirm password:') {
                if (password !== currentInput) {
                    setLines((prev) => [
                        ...prev,
                        {
                            type: 'error',
                            content: 'Passwords do not match. Try again.',
                        },
                        { type: 'output', content: 'Enter a password:' },
                    ]);
                    setCurrentInput('');
                    return;
                }

                // Добавляем временную строку "Registering..."
                setLines((prev) => [
                    ...prev,
                    { type: 'loading', content: 'Registering...' },
                ]);
                setCurrentInput('');
                setIsLoading(true);

                const errorMessage = await register(nickname, password);
                setIsLoading(false);

                if (errorMessage) {
                    // Удаляем сообщение "Registering..." перед показом ошибки
                    setLines((prev) =>
                        prev
                            .filter((line) => line.type !== 'loading')
                            .concat([
                                { type: 'error', content: errorMessage },
                                {
                                    type: 'output',
                                    content: 'Enter a nickname:',
                                },
                            ]),
                    );
                    setNickname('');
                    setPassword('');
                } else {
                    // Убираем "Registering..." и редиректим
                    setLines((prev) =>
                        prev
                            .filter((line) => line.type !== 'loading')
                            .concat([
                                {
                                    type: 'output',
                                    content:
                                        'Registration successful! Redirecting to login',
                                    withLoader: true,
                                },
                            ]),
                    );
                    setTimeout(() => navigate('/auth'), 3000);
                }
            } else if (lastLine.type === 'error') {
                setLines([{ type: 'output', content: 'Enter a nickname:' }]);
                setNickname('');
                setPassword('');
                setCurrentInput('');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentInput(e.target.value);
    };

    return (
        <div className="p-1 text-m terminal-container">
            <div className="flex items-center mb-4 gap-2">
                <span>Registration</span>
                <span>{' | '}</span>
                <button
                    onClick={() => navigate('/auth')}
                    className="text-white hover:underline"
                >
                    login
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
                                <span></span>
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
                                    lines[lines.length - 1]?.content.includes(
                                        'password',
                                    )
                                        ? 'password'
                                        : 'text'
                                }
                                value={currentInput}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                className={`text-white bg-transparent border-none focus:outline-none flex-1 ${
                                    lines[lines.length - 1]?.content ===
                                    'Enter a password:'
                                        ? 'opacity-0'
                                        : lines[lines.length - 1]?.content ===
                                            'Confirm password:'
                                          ? 'opacity-0'
                                          : ''
                                }`}
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <div ref={endRef} />
                </div>
            </div>
        </div>
    );
};

export default Registration;
