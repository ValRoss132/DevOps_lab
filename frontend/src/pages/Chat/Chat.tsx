import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { useAuthStore } from '../../stores/useAuthStore';
import { useUserStore } from '../../stores/useUserStore';

interface Message {
    id: string;
    text: string;
    userId: number;
    userName: string;
    timestamp: Date;
}

// Используем порт 32000 для обращения к backend через NodePort
const SERVER_URL = `http://${window.location.hostname}:32000`;
const socket: Socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
});

const Chat: React.FC = () => {
    const { checkAuth, logout } = useAuthStore();
    const { user, updateUserName, deleteUser } = useUserStore();

    const [lines, setLines] = useState<string[]>([]); // Добавляю недостающую переменную setLines
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [currentInput, setCurrentInput] = useState(''); // Новое состояние для текущего ввода

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        setIsConnected(socket.connected);

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('message', (newMessage: Message) => {
            setMessages((prev) => {
                // Проверяем, есть ли уже такое сообщение
                if (!prev.some((msg) => msg.id === newMessage.id)) {
                    return [...prev, newMessage];
                }
                return prev;
            });
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('message');
        };
    }, []);

    useEffect(() => {
        const check = async () => {
            await checkAuth();
            setIsCheckingAuth(false);
        };
        check();
    }, [checkAuth]);

    const handleSendMessage = () => {
        if (currentInput.trim()) {
            setLines((prevLines: string[]) => [...prevLines, currentInput]); // Задаю явный тип для prevLines
            setCurrentInput('');
        }
    };

    const handleUpdateUserName = async () => {
        if (newName.trim() && newName !== user?.name) {
            const error = await updateUserName(newName);
            if (!error) {
                setIsEditing(false);
                setNewName(''); // Clear the newName state after successful update
            } else {
                alert(error);
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    const handleDelete = async () => {
        await deleteUser();
        navigate('/auth');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
    }, [messages]);

    return (
        <div className="p-1 text-m">
            <div className="border flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <span>Chat</span>
                    {isConnected ? (
                        <span>
                            [<span className="text-green-300">connected</span>]
                        </span>
                    ) : (
                        <span>
                            [<span className="text-red-300">not connected</span>
                            ]{/* Explicit spacing added */}
                        </span>
                    )}
                </div>
                {user && !isCheckingAuth && (
                    <div>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleUpdateUserName}
                                    className="text-white"
                                >
                                    save
                                </button>
                                <span>{' | '}</span>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className=" text-white"
                                >
                                    cancel
                                </button>
                                <span>{' | '}</span>
                                <button
                                    onClick={handleDelete}
                                    className="text-white"
                                >
                                    delete
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-gray-200 font-bold">
                                    {user.name}
                                </span>
                                <span>{' | '}</span>
                                <button onClick={() => setIsEditing(true)}>
                                    edit
                                </button>
                                <span>{' | '}</span>
                                <button
                                    onClick={handleLogout}
                                    className=" text-white "
                                >
                                    logout
                                </button>
                            </>
                        )}
                    </div>
                )}
                {!user && (
                    <button onClick={() => navigate('/auth')}>login</button>
                )}
            </div>

            <div className="primary-container overflow-hidden flex">
                <div className="flex-1 overflow-y-auto flex flex-col">
                    {messages.map((msg) => (
                        <div key={msg.id}>
                            <span className="text-gray-200">
                                {msg.userName}
                            </span>{' '}
                            <span className="text-gray-400">
                                [{dayjs(msg.timestamp).format('HH:mm:ss')}]
                            </span>{' '}
                            <span>{'~ $'}</span> {msg.text}
                        </div>
                    ))}
                    <div className="chat-messages">
                        {lines.map((line, index) => (
                            <div key={index} className="message">
                                {line}
                            </div>
                        ))}
                    </div>
                    <div className="flex">
                        <span className="text-white">{'>'}&nbsp;</span>
                        <input
                            className="text-white border-none focus:outline-none ml-2 w-full"
                            placeholder={
                                isEditing
                                    ? 'Enter your new name'
                                    : 'Type a message'
                            } // Updated placeholder for consistency with test expectations
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
