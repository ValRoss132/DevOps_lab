import express, { Request, Response } from 'express';
import config from './config';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();
const port = config.port;

async function main() {

    app.use(express.json());
    
    app.use('/api', routes)
    
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

main();
