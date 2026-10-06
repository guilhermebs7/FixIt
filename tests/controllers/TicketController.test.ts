import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMocks = vi.hoisted(() => ({
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
}));

vi.mock('../../src/services/TicketService.js', () => ({
    TicketService: class {
        create = serviceMocks.create;
        findAll = serviceMocks.findAll;
        findById = serviceMocks.findById;
        updateStatus = serviceMocks.updateStatus;
    },
}));

import { TicketController } from '../../src/controllers/TicketController.js';

function responseMock() {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    return res;
}

describe('TicketController', () => {
    beforeEach(() => vi.clearAllMocks());

    it('usa o usuário autenticado ao criar ticket', async () => {
        const controller = new TicketController();
        const res = responseMock();
        serviceMocks.create.mockResolvedValue({ id: 'ticket-1' });

        await controller.create({
            body: {
                titulo: 'Falha',
                descricao: 'Computador sem rede',
                equipamentoId: 'equipment-1',
            },
            user: { id: 'user-1', role: 'USUARIO' },
        } as any, res as any);

        expect(serviceMocks.create).toHaveBeenCalledWith({
            titulo: 'Falha',
            descricao: 'Computador sem rede',
            equipamentoId: 'equipment-1',
            solicitanteId: 'user-1',
        });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('atualiza o status usando o ID da rota', async () => {
        const controller = new TicketController();
        const res = responseMock();
        serviceMocks.updateStatus.mockResolvedValue({ id: 'ticket-1', status: 'COMPLETO' });

        await controller.updateStatus({
            params: { id: 'ticket-1' },
            body: { status: 'COMPLETO', tecnicoId: 'technician-1' },
        } as any, res as any);

        expect(serviceMocks.updateStatus).toHaveBeenCalledWith({
            ticketId: 'ticket-1',
            status: 'COMPLETO',
            tecnicoId: 'technician-1',
        });
        expect(res.json).toHaveBeenCalledWith({ id: 'ticket-1', status: 'COMPLETO' });
    });
});
