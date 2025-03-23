import { IDatabase, IMain } from 'pg-promise';

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}

export default (db: IDatabase<any>) => {
    return {
        create: async (name: string, email: string, password: string) => {
            return db.one(
                'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
                [name, email, password],
            );
        },

        getById: async (id: number) => {
            return db.one('SELECT * FROM users WHERE id = $1', [id]);
        },

        update: async (
            id: number,
            name: string,
            email: string,
            password: string,
        ) => {
            return db.one(
                'UPDATE users SET name = $2, email = $3, password = $4 WHERE id = $1 RETURNING *',
                [id, name, email, password],
            );
        },

        delete: async (id: number) => {
            return db.result('DELETE FROM users WHERE id = $1', [id], r => r.rowCount);
        },
    };
};
