import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
    user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

const bcryptMock = vi.hoisted(() => ({
    hash: vi.fn(),
}));

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));
vi.mock('bcryptjs', () => ({ default: bcryptMock }));

import { UserService } from '../../src/services/UserService.js';

describe('UserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('cria um usuário com a senha protegida e não a retorna', async () => {
        const service = new UserService();
        const user = {
            id: 'user-1',
            nome: 'Maria',
            email: 'maria@example.com',
            password: 'senha-hash',
            role: 'USUARIO',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        prismaMock.user.findUnique.mockResolvedValue(null);
        bcryptMock.hash.mockResolvedValue('senha-hash');
        prismaMock.user.create.mockResolvedValue(user);

        const result = await service.create({
            nome: 'Maria',
            email: 'maria@example.com',
            password: 'senha-original',
        });

        expect(bcryptMock.hash).toHaveBeenCalledWith('senha-original', 8);
        expect(prismaMock.user.create).toHaveBeenCalledWith({
            data: {
                nome: 'Maria',
                email: 'maria@example.com',
                password: 'senha-hash',
            },
        });
        expect(result).toEqual({
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
        expect(result).not.toHaveProperty('password');
    });

    it('recusa criar outro usuário com o mesmo email', async () => {
        const service = new UserService();
        prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user' });

        await expect(service.create({
            nome: 'Maria',
            email: 'maria@example.com',
            password: 'senha-original',
        })).rejects.toThrow('Já existe um usuário cadastrado com este email');

        expect(bcryptMock.hash).not.toHaveBeenCalled();
        expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('retorna erro quando o usuário não existe', async () => {
        const service = new UserService();
        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(service.findById('missing-user'))
            .rejects.toThrow('Usuario não encontrado.');
    });
});
