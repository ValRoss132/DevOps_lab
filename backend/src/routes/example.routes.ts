import { Router } from 'express';
import { getExample } from '../controllers/example.controller';

const route = Router();

route.get('/', getExample)

export default route;