import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
    ticket: {
        findUnique: vi.fn(),
        update: vi.fn(),
    },
    user: { findUnique: vi.fn() },
    manutencao: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

import { ManutencaoService } from '../../src/services/ManutencaoService.js';

describe('ManutencaoService', () => {
    beforeEach(() => vi.clearAllMocks());

    it('cria manutenção e inicia ticket aberto', async () => {
        const service = new ManutencaoService();
        const startedAt = new Date('2026-01-01T10:00:00Z');
        const finishedAt = new Date('2026-01-01T11:00:00Z');
        const maintenance = { id: 'maintenance-1', ticketId: 'ticket-1' };
        prismaMock.ticket.findUnique.mockResolvedValue({ id: 'ticket-1', status: 'ABERTO' });
        prismaMock.user.findUnique.mockResolvedValue({ id: 'technician-1' });
        prismaMock.manutencao.create.mockResolvedValue(maintenance);

        await expect(service.create({
            ticketId: 'ticket-1',
            tecnicoId: 'technician-1',
            descricao: 'Troca de cabo',
            custo: 25,
            startedAt,
            finishedAt,
        })).resolves.toEqual(maintenance);

        expect(prismaMock.ticket.update).toHaveBeenCalledWith({
            where: { id: 'ticket-1' },
            data: { status: 'EM_PROGRESSO', technicianId: 'technician-1' },
        });
    });

    it('valida ticket e técnico antes de criar manutenção', async () => {
        const service = new ManutencaoService();
        prismaMock.ticket.findUnique.mockResolvedValue(null);

        await expect(service.create({
            ticketId: 'missing-ticket',
            tecnicoId: 'technician-1',
            descricao: 'Diagnóstico',
            custo: 0,
        })).rejects.toThrow('Chamado (Ticket) não encontrado.');

        prismaMock.ticket.findUnique.mockResolvedValue({ id: 'ticket-1' });
        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(service.create({
            ticketId: 'ticket-1',
            tecnicoId: 'missing-technician',
            descricao: 'Diagnóstico',
            custo: 0,
        })).rejects.toThrow('Técnico não encontrado.');
        expect(prismaMock.manutencao.create).not.toHaveBeenCalled();
    });

    it('finaliza manutenção e completa o ticket', async () => {
        const service = new ManutencaoService();
        const finishedAt = new Date('2026-01-02T12:00:00Z');
        prismaMock.manutencao.findUnique.mockResolvedValue({
            id: 'maintenance-1',
            ticketId: 'ticket-1',
        });
        prismaMock.manutencao.update.mockResolvedValue({
            id: 'maintenance-1',
            finishedAt,
        });

        await expect(service.finishMaintenance('maintenance-1', finishedAt))
            .resolves.toEqual({ id: 'maintenance-1', finishedAt });
        expect(prismaMock.ticket.update).toHaveBeenCalledWith({
            where: { id: 'ticket-1' },
            data: { status: 'COMPLETO' },
        });
    });
});
