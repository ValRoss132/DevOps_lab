import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://192.168.3.62:4200';
const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
});

const Chat: React.FC = () => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
            console.log('✅ Подключено к серверу');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('❌ Отключено от сервера');
        });

        socket.on('message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off('message');
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && message.trim()) {
            socket.emit('message', message);
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h1 className="justify-self-start">
                Чат {isConnected ? '🟢' : '🔴'}
            </h1>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <label>
                &#62;
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isConnected}
                />
            </label>
        </div>
    );
};

export default Chat;
