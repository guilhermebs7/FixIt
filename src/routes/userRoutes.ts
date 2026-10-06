import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { validateSchema } from '@/middlewares/validateSchema';
import { createUserSchema } from '@/schemas/UserSchema';
const userRoutes= Router();
const userController=  new UserController();

userRoutes.post('/', 
    validateSchema({body : createUserSchema}),
    (req, res) => userController.create(req, res));
userRoutes.get('/', (req, res) => userController.findAll(req, res));
userRoutes.get('/:id', (req, res) => userController.findById(req, res));
userRoutes.put('/:id', (req, res) => userController.update(req, res));
userRoutes.delete('/:id', (req, res) => userController.delete(req, res));

export{ userRoutes}