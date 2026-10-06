import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({    //representa um Prisma falso
    user: { findUnique: vi.fn() }, //aqui são criadas funções falsas já que n acessamos o bd
}));

const bcryptMock = vi.hoisted(() => ({
    compare: vi.fn(), // cria uma função de comparação de senhas utilizando a função compare porem falsa 
}));

const jwtMock = vi.hoisted(() => ({
    sign: vi.fn(),
}));

//substituindo os módulos reais pelos mocks
vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));   //o vi é o objeto principal de mocking do Vitest ele quem permite criar mocks, funções falsas , verificar se uma função foi chamada
vi.mock('bcryptjs', () => ({ default: bcryptMock }));
vi.mock('jsonwebtoken', () => ({ default: jwtMock }));

import { AuthenticateUserService } from '../../src/services/AuthenticateUserService.js';

describe('AuthenticateUserService', () => {   //describe serve para agrupar vários testes relacionados " Agora vou fazer os teste do AuthenticateUserService"
    beforeEach(() => {
        vi.clearAllMocks();     //limpa os mocks , imagine que jwtMock.sign foi chamado no primeiro teste e o Vitest registra: sign foi chamado 1 vez no próximo teste n queremos que ele continue contando a chamada anterior
        process.env.JWT_SECRET = 'secret-test';
    });

    it('autentica o usuário e retorna seus dados com token', async () => {    //it : define um texto específico , o primeiro parâmtro é a descrição e o segundo a função que executa o teste 
        const service = new AuthenticateUserService();
        const user = {
            id: 'user-1',
            nome: 'Maria',
            email: 'maria@example.com',
            password: 'hash',
            role: 'USUARIO',
        };
        prismaMock.user.findUnique.mockResolvedValue(user);
        bcryptMock.compare.mockResolvedValue(true);  //simula uma senha correta
        jwtMock.sign.mockReturnValue('token-test');

        await expect(service.execute({
            email: user.email,
            password: 'senha',
        })).resolves.toEqual({
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role,
            },
            token: 'token-test',
        });

        expect(jwtMock.sign).toHaveBeenCalledWith(   //expect é usado para fazer afirmações : espero que resultado seja igual a isso
            { role: user.role },
            'secret-test',
            { subject: user.id, expiresIn: '1d' },
        );
    });

    it('recusa email inexistente ou senha inválida', async () => {
        const service = new AuthenticateUserService();
        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(service.execute({
            email: 'missing@example.com',
            password: 'senha',
        })).rejects.toThrow('Email ou senha incorretos.');    //rejects: espero que essa Promise dê erro/rejeite

        prismaMock.user.findUnique.mockResolvedValue({
            id: 'user-1',
            password: 'hash',
        });
        bcryptMock.compare.mockResolvedValue(false);

        await expect(service.execute({
            email: 'user@example.com',
            password: 'senha-errada',
        })).rejects.toThrow('Email ou senha incorretas.');
    });

    it('falha quando o segredo JWT não está configurado', async () => {
        const service = new AuthenticateUserService();
        delete process.env.JWT_SECRET;
        prismaMock.user.findUnique.mockResolvedValue({
            id: 'user-1',
            nome: 'Maria',
            email: 'maria@example.com',
            password: 'hash',
            role: 'USUARIO',
        });
        bcryptMock.compare.mockResolvedValue(true);

        await expect(service.execute({
            email: 'maria@example.com',
            password: 'senha',
        })).rejects.toThrow('JWT_SECRET não configurado');
        expect(jwtMock.sign).not.toHaveBeenCalled();
    });
});
