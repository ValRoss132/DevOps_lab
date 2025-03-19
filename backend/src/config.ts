import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'database',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password'
    },
    nodeEnv: process.env.NODE_ENV || 'development'
}

export default config