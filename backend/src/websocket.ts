import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export const setupWebSockets = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('message', (data) => {
            console.log(`Message from ${socket.id}:`, data);
            io.emit('message', data);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};
