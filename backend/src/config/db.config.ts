import pgPromise from "pg-promise"
import config from "../config"

const pgp = pgPromise();
const db = pgp({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password
})

db.connect().then(() => {
    console.log('Connected to database');
}).catch((error) => {
    console.error('Error connecting to database:', error);
});

export default db