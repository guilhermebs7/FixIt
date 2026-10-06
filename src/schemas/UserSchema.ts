import { z } from 'zod';

export const createUserSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Forneça um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  role: z.enum(['ADMINISTRADOR', 'TECNICO', 'USUARIO']).optional(),
}); 

export const loginSchema = z.object({
  email: z.string().email('Forneça um e-mail válido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});