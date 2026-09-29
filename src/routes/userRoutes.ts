import { Router } from 'express';
import { UserController } from '@/controllers/UserController';

const userRoutes= Router();
const userController=  new UserController();

userRoutes.post('/', (req, res) => userController.create(req, res));
userRoutes.get('/', (req, res) => userController.findAll(req, res));
userRoutes.get('/:id', (req, res) => userController.findById(req, res));
userRoutes.put('/:id', (req, res) => userController.update(req, res));
userRoutes.delete('/:id', (req, res) => userController.delete(req, res));

export{ userRoutes}