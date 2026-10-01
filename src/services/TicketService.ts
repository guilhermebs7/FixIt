import { prisma } from '../config/prisma.js';
import { Ticket, TicketStatus } from '@prisma/client';

interface ICreateTicketDTO{
    titulo: string;
    descricao: string;
    equipamentoId: string;
    solicitanteId: string;
}
interface IUpdateStatusDTO{
    ticketId: string;
    status: TicketStatus;
    tecnicoId? : string;   //opcional: para atribuir o técninco ao mesmo tempo
}
export class TicketService{
    async create ({ titulo, descricao, equipamentoId, solicitanteId}:ICreateTicketDTO): Promise<Ticket>{
        const equipamentoExiste = await prisma.equipamento.findUnique({
            where :{id: equipamentoId},
        });
        if(!equipamentoExiste){
            throw new Error('Equipamento informado não foi encontrado.');
        }
        const ticket = await prisma.ticket.create({
            data:{
                titulo,
                descricao,
                equipamentoId,
                solicitanteId,
                status: 'ABERTO',
            },
            include:{     // include : além do ticket , me traga também informações relacionadas
                equipamento: true,   //traga os dados de equipamento
                solicitante: {      //traga informações do usuario que abriu o chamado
                    select: {id: true, nome: true, email:true, role: true},   //seleciona so os dados importantes não todos
                },
            },
        });
        return ticket ;
    }
    async findAll(): Promise<Ticket[]>{
        return prisma.ticket.findMany({
            include: {
                equipamento: true,
                solicitante:{
                    select: {id: true, nome: true, email: true},
                },
                tecninco:{
                  select: { id: true, nome: true, email: true },  
                },
            },
            orderBy: {createdAt: 'desc'},
        });
    }
    async findById(id: string): Promise<Ticket> {
        const ticket = await prisma.ticket.findUnique({
            where: {id},
            include: {
                equipamento: true,
                solicitante:{
                  select: { id: true, nome: true, email: true },  
                },
                tecninco:{
                    select: { id: true, nome: true, email: true },
                },
            },
        });
        if(!ticket){
            throw new Error('Chamado não encontrado.');
        }
        return ticket;
    }
    async updateStatus({ticketId, status, tecnicoId}: IUpdateStatusDTO): Promise<Ticket>{  //alterar o status do chamado e, opcionalmente atribuir um técninco
        await this.findById(ticketId);
        const ticket= await prisma.ticket.update({
            where:{ id: ticketId},
            data:{
                status,
                ...(tecnicoId && { tecnicoId}),  //se tecnicoId existir, inclua tecnicoId na atualizacao . Se caso n existir n deve aparecer no campo de atualizacao
            },
            include: {
                equipamento: true,
                solicitante:{
                    select: { id: true, nome: true, email: true },
                },
                tecninco:{
                  select: { id: true, nome: true, email: true },  
                },
            },
        });
        return ticket;
    }
}
