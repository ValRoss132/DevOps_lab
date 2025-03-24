import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import os from 'os'
import config from './config';
import routes from './routes';
import { setupWebSockets } from './websocket';

const app = express();
const server = http.createServer(app);
const port = config.port;

async function main() {
    app.use(cors());
    app.use(express.json());

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
