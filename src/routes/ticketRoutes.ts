import { Router } from 'express';
import { TicketController } from '@/controllers/TicketController';

const ticketRoutes = Router();
const ticketController = new TicketController();

ticketRoutes.post('/', (req, res) => ticketController.create(req, res));
ticketRoutes.get('/', (req, res) => ticketController.findAll(req, res));
ticketRoutes.get('/:id', (req, res) => ticketController.findById(req, res));
ticketRoutes.patch('/:id/status', (req, res) => ticketController.updateStatus(req, res));

export { ticketRoutes };