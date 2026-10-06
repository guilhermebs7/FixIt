import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
    equipamento: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

import { EquipamentoService } from '../../src/services/EquipamentoService.js';

describe('EquipamentoService', () => {
    beforeEach(() => vi.clearAllMocks());

    it('cria um equipamento quando o tombamento é único', async () => {
        const service = new EquipamentoService();
        const data = {
            nome: 'Notebook',
            tombamento: 'T-001',
            tipo: 'Computador',
            marca: 'Dell',
            modelo: 'Latitude',
            localizacao: 'Sala 1',
        };
        const equipamento = { id: 'equipment-1', ...data };
        prismaMock.equipamento.findUnique.mockResolvedValue(null);
        prismaMock.equipamento.create.mockResolvedValue(equipamento);

        await expect(service.create(data)).resolves.toEqual(equipamento);
        expect(prismaMock.equipamento.create).toHaveBeenCalledWith({ data });
    });

    it('recusa tombamento já cadastrado', async () => {
        const service = new EquipamentoService();
        prismaMock.equipamento.findUnique.mockResolvedValue({ id: 'equipment-1' });

        await expect(service.create({
            nome: 'Notebook',
            tombamento: 'T-001',
            tipo: 'Computador',
            marca: 'Dell',
            modelo: 'Latitude',
            localizacao: 'Sala 1',
        })).rejects.toThrow('Já existe um equipamento cadastrado com este número de tombamento');
        expect(prismaMock.equipamento.create).not.toHaveBeenCalled();
    });

    it('atualiza e remove apenas equipamentos existentes', async () => {
        const service = new EquipamentoService();
        const equipamento = { id: 'equipment-1', nome: 'Notebook' };
        prismaMock.equipamento.findUnique.mockResolvedValue(equipamento);
        prismaMock.equipamento.update.mockResolvedValue({ ...equipamento, nome: 'Desktop' });

        await expect(service.update('equipment-1', { nome: 'Desktop' }))
            .resolves.toEqual({ ...equipamento, nome: 'Desktop' });
        await service.delete('equipment-1');

        expect(prismaMock.equipamento.update).toHaveBeenCalledWith({
            where: { id: 'equipment-1' },
            data: { nome: 'Desktop' },
        });
        expect(prismaMock.equipamento.delete).toHaveBeenCalledWith({
            where: { id: 'equipment-1' },
        });

        prismaMock.equipamento.findUnique.mockResolvedValue(null);
        await expect(service.findById('missing'))
            .rejects.toThrow('Equipamento não encontrado');
    });
});
