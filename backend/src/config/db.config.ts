import pgPromise from 'pg-promise';
import config from '../config';

const pgp = pgPromise();
const db = pgp({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

db.connect()
    .then(() => {
        console.log('Connected to database');
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
    });

const createTable = async () => {
    try {
        await db.none(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
            `);
        console.log('✅ Таблица users создана или уже существует.');
    } catch (error) {
        console.error('❌ Ошибка при создании таблицы:', error);
    }
};

createTable();

export default db;
