import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    database: {
        host: process.env.DATABASE_HOST || 'db',
        port: Number(process.env.DATABASE_PORT) || 15432,
        name: process.env.DATABASE_NAME || 'database',
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'password',
    },
    nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
