import express from 'express';
import http from 'http';
import cors from 'cors';
import os from 'os';
import config from './config';
import routes from './routes';
import { setupWebSockets } from './websocket';
import session from 'express-session';
import pgSession from 'connect-pg-simple';

const app = express();
const server = http.createServer(app);
const port = config.port;
const PgSession = pgSession(session);

async function main() {
    app.use(
        cors({
            origin: [
                'http://localhost:5173',
                'http://localhost:8080',
                'http://192.168.3.62:5173',
                'http://172.20.10.13:5173',
                'http://192.168.110.119:5173',
            ],
            credentials: true,
        }),
    );
    app.use(express.json());

    app.use(
        session({
            store: new PgSession({
                conObject: {
                    host: config.database.host,
                    port: config.database.port,
                    database: config.database.name,
                    user: config.database.user,
                    password: config.database.password,
                },
                tableName: 'session',
                createTableIfMissing: true,
            }),
            secret: 'super_secret_key',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24,
            },
        }),
    );

    app.use('/api', routes);

    setupWebSockets(server);

    server.listen(port, () => {
        console.log(`Server running at port: ${port}`);

        const interfaces = os.networkInterfaces();
        Object.keys(interfaces).forEach((name) => {
            interfaces[name]?.forEach((iface) => {
                if (iface.family === 'IPv4' && !iface.internal) {
                    console.log(
                        `🌍 Доступен по адресу: http://${iface.address}:${port}`,
                    );
                }
            });
        });
    });
}

main();
