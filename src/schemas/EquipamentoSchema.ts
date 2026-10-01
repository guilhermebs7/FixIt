import { z } from 'zod';

export const createEquipmentSchema = z.object({
  nome: z.string().min(2, 'O nome do equipamento é obrigatório.'),
  tombamento: z.string().min(2, 'O número de tombamento é obrigatório.'),
});

export const idParamSchema = z.object({
  id: z.string().uuid('O ID informado na URL deve ser um UUID válido.'),
});