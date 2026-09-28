import {prisma} from '../config/prisma.js';
import {Equipamento, Prisma} from '@prisma/client';   // o prisma gera um tipo Equipamento equivalente à estrutura desse registro.

export class EquipamentoService{
    async create(data: Prisma.EquipamentoCreateInput): Promise <Equipamento>{ // async indica que essa função trabalha com operações assíncronas. Como estamos acessando bd , precisamos esperar a resposta. data=equipamento que queremos cadastrar , 'data:Prisma.EquipamentoCreateInput: siginfica data precisa estar no formato aceito pleo Prisma para criar um Equipamento, Promise<Equipamento> significa que a função retorna de forma assíncrona: equipamento
        const existeEquipamento = await prisma.equipamento.findUnique({
            where: {tombamento: data.tombamento},  //esta procurando tombamento que veio dentro de data.tombamento
        });

        if(existeEquipamento){
            throw new Error('Já existe um equipamento cadastrado com este número de tombamento');
        }

        return prisma.equipamento.create({data});
    }
    async findAll() : Promise<Equipamento[]>{
        return prisma.equipamento.findMany({
            orderBy : {createdAt : 'desc'},   
        });
    }
    async findById(id: string) : Promise <Equipamento>{
        const equipamento = await prisma.equipamento.findUnique({
            where : {id},   
        });
        if(!equipamento){
            throw new Error('Equipamento não encontrado');
        }
        return equipamento;
    }
    async update(id: string, data: Prisma.EquipamentoUpdateInput): Promise<Equipamento>{
        await this.findById(id);
        return prisma.equipamento.update({
            where : {id},
            data,
        });
    }
    async delete(id: string) : Promise<void> {
        await this.findById(id);
        await prisma.equipamento.delete({
            where : {id}
        });
    }
}