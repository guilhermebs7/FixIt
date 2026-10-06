import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMocks = vi.hoisted(() => ({
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}));

vi.mock('@/services/UserService', () => ({
    UserService: class {
        create = serviceMocks.create;
        findAll = serviceMocks.findAll;
        findById = serviceMocks.findById;
        update = serviceMocks.update;
        delete = serviceMocks.delete;
    },
}));

import { UserController } from '../../src/controllers/UserController.js';

function responseMock() {
    const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() };
    res.status.mockReturnValue(res);
    return res;
}

describe('UserController', () => {
    beforeEach(() => vi.clearAllMocks());

    it('executa as operações principais de usuário', async () => {
        const controller = new UserController();
        const res = responseMock();
        serviceMocks.create.mockResolvedValue({ id: 'user-1' });
        serviceMocks.findAll.mockResolvedValue([]);
        serviceMocks.findById.mockResolvedValue({ id: 'user-1' });
        serviceMocks.update.mockResolvedValue({ id: 'user-1' });
        serviceMocks.delete.mockResolvedValue(undefined);

        await controller.create({ body: { nome: 'Maria' } } as any, res as any);
        await controller.findAll({} as any, res as any);
        await controller.findById({ params: { id: 'user-1' } } as any, res as any);
        await controller.update({ params: { id: 'user-1' }, body: {} } as any, res as any);
        await controller.delete({ params: { id: 'user-1' } } as any, res as any);

        expect(serviceMocks.create).toHaveBeenCalledWith({ nome: 'Maria' });
        expect(serviceMocks.findById).toHaveBeenCalledWith('user-1');
        expect(serviceMocks.update).toHaveBeenCalledWith('user-1', {});
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('retorna 404 quando não encontra usuário', async () => {
        const controller = new UserController();
        const res = responseMock();
        serviceMocks.findById.mockRejectedValue(new Error('Usuário não encontrado'));

        await controller.findById({ params: { id: 'missing' } } as any, res as any);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado' });
    });
});
