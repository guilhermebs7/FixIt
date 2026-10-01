import { Request, Response } from 'express';
import { ManutencaoService } from '@/services/ManutencaoService';

const manutencaoService = new ManutencaoService();

export class ManutencaoController{
    async create(req: Request, res: Response): Promise<Response>{
     try{
      const { ticketId, descricao, custo, startedAt, finishedAt } = req.body;
      const tecnicoId = req.user.id; 

      const manutencao = await manutencaoService.create({
        ticketId,
        tecnicoId,
        descricao,
        custo: Number(custo),
        startedAt: startedAt ? new Date(startedAt) : undefined,
        finishedAt: finishedAt ? new Date(finishedAt) : undefined,
      });
      return res.status(201).json(manutencao);
        }catch(error: any){
            return res.status(400).json({ message: error.message });
        }
    }
    async findByTicket(req: Request, res: Response): Promise<Response> {
    try {
      const ticketId = String(req.params.ticketId);
      const manutencoes = await manutencaoService.findByTicket(ticketId);
      return res.json(manutencoes);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
  async finish(req: Request, res: Response): Promise<Response> {
    try {
      const id = String(req.params.id);
      const { finishedAt } = req.body;

      const maintenance = await manutencaoService.finishMaintenance(
        id,
        finishedAt ? new Date(finishedAt) : undefined
      );

      return res.json(maintenance);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}