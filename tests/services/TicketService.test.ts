import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
    equipamento: { findUnique: vi.fn() },
    ticket: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

import { TicketService } from '../../src/services/TicketService.js';

describe('TicketService', () => {
    beforeEach(() => vi.clearAllMocks());

    it('cria ticket aberto para equipamento existente', async () => {
        const service = new TicketService();
        const data = {
            titulo: 'Computador sem rede',
            descricao: 'A conexão caiu',
            equipamentoId: 'equipment-1',
            solicitanteId: 'user-1',
        };
        const ticket = { id: 'ticket-1', ...data, status: 'ABERTO' };
        prismaMock.equipamento.findUnique.mockResolvedValue({ id: data.equipamentoId });
        prismaMock.ticket.create.mockResolvedValue(ticket);

        await expect(service.create(data)).resolves.toEqual(ticket);
        expect(prismaMock.ticket.create).toHaveBeenCalledWith(expect.objectContaining({
            data: { ...data, status: 'ABERTO' },
        }));
    });

    it('não cria ticket para equipamento inexistente', async () => {
        const service = new TicketService();
        prismaMock.equipamento.findUnique.mockResolvedValue(null);

        await expect(service.create({
            titulo: 'Falha',
            descricao: 'Detalhes',
            equipamentoId: 'missing',
            solicitanteId: 'user-1',
        })).rejects.toThrow('Equipamento informado não foi encontrado.');
        expect(prismaMock.ticket.create).not.toHaveBeenCalled();
    });

    it('atualiza status com técnico quando informado', async () => {
        const service = new TicketService();
        prismaMock.ticket.findUnique.mockResolvedValue({ id: 'ticket-1' });
        prismaMock.ticket.update.mockResolvedValue({ id: 'ticket-1', status: 'EM_PROGRESSO' });

        await service.updateStatus({
            ticketId: 'ticket-1',
            status: 'EM_PROGRESSO',
            tecnicoId: 'technician-1',
        });

        expect(prismaMock.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'ticket-1' },
            data: { status: 'EM_PROGRESSO', tecnicoId: 'technician-1' },
        }));
    });

    it('retorna erro ao buscar ticket inexistente', async () => {
        const service = new TicketService();
        prismaMock.ticket.findUnique.mockResolvedValue(null);

        await expect(service.findById('missing'))
            .rejects.toThrow('Chamado não encontrado.');
    });
});
