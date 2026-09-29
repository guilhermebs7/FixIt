import { Request, Response } from 'express';
import { UserService } from '@/services/UserService';

const userService = new UserService();

export class UserController{
    async create(req: Request, res: Response): Promise<Response>{
        try{
            const user= await userService.create(req.body);
            return res.status(201).json(user);
        }catch(error: any){
            return res.status(400).json({ message: error.message });
        }
    }

    async findAll(req: Request, res: Response): Promise<Response>{
        try{
            const users= await userService.findAll();
            return res.json(users);
        }catch (error: any) {
           return res.status(500).json({ message: error.message });
     }
    }
    async findById(req: Request<{id: string}>, res: Response): Promise<Response> {
        try{
            const {id} = req.params;
            const user= await userService.findById(id);
            return res.json(user);
        }catch(error:any){
            return res.status(404).json({ message: error.message });
        }
    }
    async update(req: Request<{id: string}>, res: Response): Promise<Response>{
        try{
            const {id} = req.params;
            const user = await userService.update(id, req.body);
            return res.json(user);
        }catch(error: any){
           return res.status(400).json({ message: error.message }); 
        }
    }
    async delete(req: Request<{id: string}>, res: Response): Promise<Response>{
        try{
            const {id}= req.params;
            await userService.delete(id);
            return res.status(204).send();
        }catch(error: any){
            return res.status(404).json({ message: error.message });
        }
    }

}