import { beforeEach, describe, expect, it, vi } from 'vitest';

const executeMock = vi.hoisted(() => vi.fn());

vi.mock('@/services/AuthenticateUserService', () => ({
    AuthenticateUserService: class {
        execute = executeMock;
    },
}));

import { AuthenticateUserController } from '../../src/controllers/AuthenticateUserController.js';

function responseMock() {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    return res;
}

describe('AuthenticateUserController', () => {
    beforeEach(() => vi.clearAllMocks());

    it('retorna os dados da autenticação', async () => {
        const controller = new AuthenticateUserController();
        const res = responseMock();
        executeMock.mockResolvedValue({ token: 'token-test' });

        await controller.handle({
            body: { email: 'maria@example.com', password: 'senha' },
        } as any, res as any);

        expect(executeMock).toHaveBeenCalledWith({
            email: 'maria@example.com',
            password: 'senha',
        });
        expect(res.json).toHaveBeenCalledWith({ token: 'token-test' });
    });

    it('retorna 401 quando a autenticação falha', async () => {
        const controller = new AuthenticateUserController();
        const res = responseMock();
        executeMock.mockRejectedValue(new Error('Credenciais inválidas'));

        await controller.handle({ body: {} } as any, res as any);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Credenciais inválidas' });
    });
});
