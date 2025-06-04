import express from 'express';
import http from 'http';
import cors from 'cors';
import os from 'os';
import config from './config';
import routes from './routes';
import { setupWebSockets } from './websocket';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import client from 'prom-client';

const app = express();
const server = http.createServer(app);
const port = config.port;
const PgSession = pgSession(session);

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});

// Middleware to count requests
app.use((req, res, next) => {
    res.on('finish', () => {
        httpRequestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode,
        });
    });
    next();
});

// endpoint метрик
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

async function main() {
    app.use(
        cors({
            origin: true, // разрешает любой origin для CORS
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
