import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  ticketId: z.string().uuid('O ID do chamado (Ticket) deve ser um UUID válido.'),
  descricao: z.string().min(5, 'A descrição deve ter pelo menos 5 caracteres.'),
  custo: z.number().nonnegative('O custo não pode ser negativo.'),
  startedAt: z.string().datetime({ message: 'Data de início inválida.' }).optional(),
  finishedAt: z.string().datetime({ message: 'Data de término inválida.' }).optional(),
});