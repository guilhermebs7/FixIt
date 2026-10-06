import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMocks = vi.hoisted(() => ({
    create: vi.fn(),
    findByTicket: vi.fn(),
    finishMaintenance: vi.fn(),
}));

vi.mock('@/services/ManutencaoService', () => ({
    ManutencaoService: class {
        create = serviceMocks.create;
        findByTicket = serviceMocks.findByTicket;
        finishMaintenance = serviceMocks.finishMaintenance;
    },
}));

import { ManutencaoController } from '../../src/controllers/ManutencaoController.js';

function responseMock() {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    return res;
}

describe('ManutencaoController', () => {
    beforeEach(() => vi.clearAllMocks());

    it('converte os dados da requisição ao criar manutenção', async () => {
        const controller = new ManutencaoController();
        const res = responseMock();
        serviceMocks.create.mockResolvedValue({ id: 'maintenance-1' });

        await controller.create({
            body: {
                ticketId: 'ticket-1',
                descricao: 'Troca de cabo',
                custo: '25.50',
                startedAt: '2026-01-01T10:00:00.000Z',
            },
            user: { id: 'technician-1' },
        } as any, res as any);

        expect(serviceMocks.create).toHaveBeenCalledWith(expect.objectContaining({
            ticketId: 'ticket-1',
            tecnicoId: 'technician-1',
            custo: 25.5,
            startedAt: new Date('2026-01-01T10:00:00.000Z'),
        }));
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('finaliza manutenção usando o ID da rota', async () => {
        const controller = new ManutencaoController();
        const res = responseMock();
        serviceMocks.finishMaintenance.mockResolvedValue({ id: 'maintenance-1' });

        await controller.finish({
            params: { id: 'maintenance-1' },
            body: { finishedAt: '2026-01-02T12:00:00.000Z' },
        } as any, res as any);

        expect(serviceMocks.finishMaintenance).toHaveBeenCalledWith(
            'maintenance-1',
            new Date('2026-01-02T12:00:00.000Z'),
        );
        expect(res.json).toHaveBeenCalledWith({ id: 'maintenance-1' });
    });
});
