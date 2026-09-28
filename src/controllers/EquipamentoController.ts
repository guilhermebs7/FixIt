import { Request, Response  } from "express";
import { EquipamentoService } from "@/services/EquipamentoService";

const equipamentoService = new EquipamentoService();

export class EquipamentoController{
    async create( req : Request, res: Response): Promise <Response>{
        try{
            const equipamento = await equipamentoService.create(req.body);
            return res.status(201).json(equipamento);
        }catch( error : any){
            return res.status(400).json({message: error.message});
        }
    }

    async findAll(req: Request, res: Response): Promise <Response>{
        try{
            const equipamentos= await equipamentoService.findAll();
            return res.json(equipamentos);
        }catch( error: any){
            return res.status(500).json({message: error.message});
        }
    }
    async findById(req: Request<{id: string}>
        , res: Response): Promise <Response>{
        try{
            const { id } = req.params;
            const equipamento = await equipamentoService.findById(id);
            return res.json(equipamento);
        }catch(error: any){
            return res.status(404).json({message: error.message});
        }
    }
    async update(req: Request<{id: string }>
        , res:Response): Promise<Response>{
        try{
            const { id }= req.params;
            const equipamento= await equipamentoService.update(id, req.body);
            return res.json(equipamento);
        }catch(error : any){
            return res.status(400).json({message : error.message});
        }
    }
    async delete(req: Request<{id: string}>  //força dizendo que o id é do tipo string e n string[] porque o controller n sabe se é apenas uma ou um array
        , res:Response): Promise<Response>{     
    try {
      const { id } = req.params;
      await equipamentoService.delete(id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }
    }

