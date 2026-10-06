import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { ensureAdmin } from '../../src/middlewares/ensureAdmin.js';
import { ensureAuthenticated } from '../../src/middlewares/ensureAuthenticated.js';
import { ensureTechnician } from '../../src/middlewares/ensureTechnician.js';

vi.mock('jsonwebtoken', () => ({
    default: { verify: vi.fn() },
}));

function responseMock() {
    const res = {
        status: vi.fn(),
        json: vi.fn(),
    };
    res.status.mockReturnValue(res);
    return res;
}

describe('middlewares de autorização', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'secret-test';
    });

    it('aceita token válido e popula req.user', () => {
        const req = { headers: { authorization: 'Bearer token-test' } } as any;
        const res = responseMock();
        const next = vi.fn();
        vi.mocked(jwt.verify).mockReturnValue({ sub: 'user-1', role: 'TECNICO' } as never);

        ensureAuthenticated(req, res as any, next);

        expect(req.user).toEqual({ id: 'user-1', role: 'TECNICO' });
        expect(jwt.verify).toHaveBeenCalledWith('token-test', 'secret-test');
        expect(next).toHaveBeenCalledOnce();
    });

    it('recusa requisição sem token ou com token inválido', () => {
        const missingReq = { headers: {} } as any;
        const missingRes = responseMock();
        const next = vi.fn();
        ensureAuthenticated(missingReq, missingRes as any, next);
        expect(missingRes.status).toHaveBeenCalledWith(401);
        expect(missingRes.json).toHaveBeenCalledWith({
            message: 'Token de autenticação não fornecido.',
        });

        vi.mocked(jwt.verify).mockImplementation(() => {
            throw new Error('invalid');
        });
        const invalidRes = responseMock();
        ensureAuthenticated(
            { headers: { authorization: 'Bearer invalid-token' } } as any,
            invalidRes as any,
            next,
        );
        expect(invalidRes.status).toHaveBeenCalledWith(401);
        expect(invalidRes.json).toHaveBeenCalledWith({
            message: 'Token inválido ou expirado.',
        });
    });

    it('permite técnico e administrador no middleware de técnico', () => {
        const next = vi.fn();
        ensureTechnician({ user: { role: 'TECNICO' } } as any, responseMock() as any, next);
        ensureTechnician({ user: { role: 'ADMINISTRADOR' } } as any, responseMock() as any, next);
        expect(next).toHaveBeenCalledTimes(2);
    });

    it('bloqueia usuário comum no middleware de técnico', () => {
        const res = responseMock();
        ensureTechnician({ user: { role: 'USUARIO' } } as any, res as any, vi.fn());

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Acesso negado: Apenas técnicos podem realizar esta operação.',
        });
    });

    it('permite apenas role ADMIN no middleware de administrador', () => {
        const next = vi.fn();
        ensureAdmin({ user: { role: 'ADMIN' } } as any, responseMock() as any, next);
        expect(next).toHaveBeenCalledOnce();

        const res = responseMock();
        ensureAdmin({ user: { role: 'USUARIO' } } as any, res as any, vi.fn());
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Acesso negado: Recursos restritos apenas para administradores.',
        });
    });
});
