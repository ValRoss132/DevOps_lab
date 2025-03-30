import { IDatabase, IMain } from 'pg-promise';

export interface User {
    id: number;
    name: string;
    password: string;
}

export default (db: IDatabase<any>) => {
    return {
        create: async (name: string, password: string) => {
            return db.one(
                'INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *',
                [name, password],
            );
        },

        getById: async (id: number) => {
            return db.one('SELECT * FROM users WHERE id = $1', [id]);
        },

        update: async (
            id: number,
            name: string,
            password: string,
        ) => {
            return db.one(
                'UPDATE users SET name = $2, password = $3 WHERE id = $1 RETURNING *',
                [id, name, password],
            );
        },

        delete: async (id: number) => {
            return db.result('DELETE FROM users WHERE id = $1', [id], r => r.rowCount);
        },
    };
};
