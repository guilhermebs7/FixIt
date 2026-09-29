import { Router } from "express";        //permite criar um conjunto de rotas separado
import { EquipamentoController } from "@/controllers/EquipamentoController";
import { ensureAdmin } from "@/middlewares/ensureAdmin";

const equipamentoRoutes= Router();       
const equipamentoController= new EquipamentoController();

equipamentoRoutes.post('/',(req, res)=>equipamentoController.create(req, res));
equipamentoRoutes.get('/',(req, res)=>equipamentoController.findAll(req, res));
equipamentoRoutes.get('/:id',(req, res)=>equipamentoController.findById(req, res));
equipamentoRoutes.put('/:id',(req, res)=>equipamentoController.update(req, res));


equipamentoRoutes.delete('/:id',ensureAdmin,(req, res)=>equipamentoController.delete(req, res));

export { equipamentoRoutes };