import { Router } from 'express';
import { AuthenticateUserController } from '@/controllers/AuthenticateUserController';
import { validateSchema } from '@/middlewares/validateSchema';
import { loginSchema } from '@/schemas/UserSchema';
/**
 * @openapi
 * /sessions:
 *   post:
 *     summary: Autenticar usuário (Login)
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: tecnico@fixit.com
 *               password:
 *                 type: string
 *                 example: senhaSegura123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso. Retorna o token JWT e dados do usuário.
 *       401:
 *         description: E-mail ou senha incorretos.
 */
const sessionRoutes = Router();
const authenticateUserController = new AuthenticateUserController();

sessionRoutes.post('/sessions',
    validateSchema({body:loginSchema}),
     (req, res) => authenticateUserController.handle(req, res));

export { sessionRoutes };