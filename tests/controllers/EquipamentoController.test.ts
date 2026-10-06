import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMocks = vi.hoisted(() => ({
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}));

vi.mock('@/services/EquipamentoService', () => ({
    EquipamentoService: class {
        create = serviceMocks.create;
        findAll = serviceMocks.findAll;
        findById = serviceMocks.findById;
        update = serviceMocks.update;
        delete = serviceMocks.delete;
    },
}));

import { EquipamentoController } from '../../src/controllers/EquipamentoController.js';

function responseMock() {
    const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() };
    res.status.mockReturnValue(res);
    return res;
}

describe('EquipamentoController', () => {
    beforeEach(() => vi.clearAllMocks());

    it('cria equipamento e retorna 201', async () => {
        const controller = new EquipamentoController();
        const res = responseMock();
        const equipamento = { id: 'equipment-1', nome: 'Notebook' };
        serviceMocks.create.mockResolvedValue(equipamento);

        await controller.create({ body: { nome: 'Notebook' } } as any, res as any);

        expect(serviceMocks.create).toHaveBeenCalledWith({ nome: 'Notebook' });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(equipamento);
    });

    it('retorna 404 quando equipamento não existe', async () => {
        const controller = new EquipamentoController();
        const res = responseMock();
        serviceMocks.findById.mockRejectedValue(new Error('Equipamento não encontrado'));

        await controller.findById({ params: { id: 'missing' } } as any, res as any);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Equipamento não encontrado' });
    });

    it('exclui equipamento e retorna 204', async () => {
        const controller = new EquipamentoController();
        const res = responseMock();
        serviceMocks.delete.mockResolvedValue(undefined);

        await controller.delete({ params: { id: 'equipment-1' } } as any, res as any);

        expect(serviceMocks.delete).toHaveBeenCalledWith('equipment-1');
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });
});
