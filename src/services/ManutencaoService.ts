import { prisma } from '../config/prisma.js';
import { Manutencao } from '@prisma/client';

interface ICreateMautencaoDTO{
  ticketId: string;
  tecnicoId: string;
  descricao: string;
  custo: number;
  startedAt?: Date;
  finishedAt?: Date; 
}
export class ManutencaoService{
    async create({
    ticketId,
    tecnicoId,
    descricao,
    custo,
    startedAt,
    finishedAt,
    }: ICreateMautencaoDTO): Promise<Manutencao>{
    const ticket = await prisma.ticket.findUnique({  //valida se o ticket existe
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new Error('Chamado (Ticket) não encontrado.');
    }

    const tecnico = await prisma.user.findUnique({
      where: { id: tecnicoId },
    });

    if (!tecnico) {
      throw new Error('Técnico não encontrado.');
    }
    const manutencao = await prisma.manutencao.create({
      data: {
        ticketId,
        tecnicoId,
        descricao,
        custo,
        startedAt: startedAt ?? new Date(),
        finishedAt: finishedAt ?? new Date(),
      },
      include: {
        ticket: {
          include: {
            equipamento: true,
          },
        },
        tecninco: {
          select: { id: true, nome: true, email: true, role: true },
        },
      },
    });
    if (ticket.status === 'ABERTO') {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'EM_PROGRESSO',
          technicianId: tecnicoId,
        },
      });
    }
    return manutencao;
    }
    async findByTicket(ticketId: string): Promise<Manutencao[]> {
    return prisma.manutencao.findMany({
      where: { ticketId },
      include: {
        tecninco: {
          select: { id: true, nome: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async finishMaintenance(id: string, finishedAt?: Date): Promise<Manutencao> {
    const maintenance = await prisma.manutencao.findUnique({
      where: { id },
    });

    if (!maintenance) {
      throw new Error('Registro de manutenção não encontrado.');
    }
    const updatedMaintenance = await prisma.manutencao.update({ 
      where: { id },
      data: {
        finishedAt: finishedAt ?? new Date(),
      },
    });
    await prisma.ticket.update({
      where: { id: maintenance.ticketId },
      data: { status: 'COMPLETO' },
    });

    return updatedMaintenance;
  }
}