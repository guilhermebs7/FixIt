import { z } from 'zod';

export const createTicketSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres.'),
  descricao: z.string().min(5, 'A descrição deve ter pelo menos 5 caracteres.'),
  equipamentoId: z.string().uuid('O ID do equipamento deve ser um UUID válido.'),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['ABERTO', 'EM_PROGRESSO', 'COMPLETO', 'CANCELADO']),
  tecnicoId: z.string().uuid('O ID do técnico deve ser um UUID válido.').optional(),
});