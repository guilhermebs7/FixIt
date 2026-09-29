import { Router } from 'express';
import { AuthenticateUserController } from '@/controllers/AuthenticateUserController';

const sessionRoutes = Router();
const authenticateUserController = new AuthenticateUserController();

sessionRoutes.post('/sessions', (req, res) => authenticateUserController.handle(req, res));

export { sessionRoutes };