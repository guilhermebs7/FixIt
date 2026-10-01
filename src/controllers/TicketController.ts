import { Request, Response } from 'express';
import { TicketService } from '../services/TicketService.js';

const ticketService = new TicketService();

export class TicketController{
    async create(req: Request, res: Response): Promise<Response>{
        try{
            const {titulo, descricao, equipamentoId} = req.body;
            const solicitanteId = req.user.id;  //extraido diretamente do token JWT

            const ticket= await ticketService.create({
                titulo,
                descricao,
                equipamentoId,
                solicitanteId
            });
            return res.status(201).json(ticket);
        }catch(error: any){
           return res.status(400).json({ message: error.message }); 
        }
    }
    async findAll(req: Request, res: Response): Promise<Response>{
        try{
        const tickets = await ticketService.findAll();
        return res.json(tickets);
        }catch(error: any){
            return res.status(500).json({ message: error.message });
        }
    }
    async findById(req: Request, res: Response): Promise<Response> {
        try{
            const id = String(req.params.id);   //pega o ID da URL , se a URL for /tickets/123  então pegara 123 e o String() garante que o valor será tratado como string
            const ticket = await ticketService.findById(id);
            return res.json(ticket);
        }catch(error: any){
            return res.status(404).json({ message: error.message });
        }
    }
    async updateStatus(req: Request, res: Response): Promise<Response>{
        try{
            const id = String(req.params.id);
            const {status, tecnicoId} = req.body;

            const ticket = await ticketService.updateStatus({
                ticketId: id,
                status,
                tecnicoId
            });
            return res.json(ticket);
        }catch(error:any){
            return res.status(400).json({ message: error.message });
        }
    }

}