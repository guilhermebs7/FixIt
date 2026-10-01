import { Router } from 'express';
import { ManutencaoController } from '@/controllers/ManutencaoController';
import { ensureTechnician } from '@/middlewares/ensureTechnician';


const manutencaoRoutes = Router();
const manutencaoController= new ManutencaoController();

manutencaoRoutes.post('/',ensureTechnician, (req, res) => manutencaoController.create(req, res));
manutencaoRoutes.get('/ticket/:ticketId', (req, res) => manutencaoController.findByTicket(req, res));
manutencaoRoutes.patch('/:id/finish',ensureTechnician, (req, res) => manutencaoController.finish(req, res));

export { manutencaoRoutes};