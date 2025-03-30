import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../stores/useAuthStore';
import dayjs from 'dayjs';
import { useUserStore } from '../../stores/useUserStore';

interface Message {
    id: string;
    text: string;
    userId: number;
    userName: string;
    timestamp: Date;
}

const SERVER_URL = `http://${window.location.hostname}:4200`;
const socket: Socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
});

const Chat: React.FC = () => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const { checkAuth } = useAuthStore();
    const { user } = useUserStore();

    useEffect(() => {
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
        checkAuth();
    }, [checkAuth]);

    const handleSendMessage = () => {
        if (message.trim() && user) {
            const newMessage: Message = {
                id: `${Date.now()}-${user.id}`,
                text: message,
                userId: user.id,
                userName: user.name,
                timestamp: new Date(),
            };
            socket.emit('message', newMessage); // Клиент теперь отправляет 'message', а не 'sendMessage'
            setMessages((prev) => [...prev, newMessage]); // Мгновенное отображение сообщения
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    console.log(user);

    return (
        <div className="p-1">
            <div className="flex items-center mb-4 gap-2">
                <span className="text-3xl">
                    Чат {isConnected ? '🟢' : '🔴'}
                </span>
                {user && (
                    <div className="text-m text-gray-500">
                        <span className="font-medium">{user.name}</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                {messages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                        <span className="text-gray-200">{msg.userName}</span>{' '}
                        <span className="text-gray-400">
                            [{dayjs(msg.timestamp).format('HH:mm:ss')}]
                        </span>{' '}
                        <span>{'~ $'}</span> {msg.text}
                    </div>
                ))}
                <div className="flex">
                    <span className="text-white">{'>'}</span>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="text-white border-none focus:outline-none ml-2 w-full"
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
};

export default Chat;
