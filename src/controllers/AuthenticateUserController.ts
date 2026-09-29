import { Request, Response } from 'express';
import { AuthenticateUserService } from '@/services/AuthenticateUserService';

const authenticateUserService= new AuthenticateUserService();

export class AuthenticateUserController{
    async handle(req: Request, res: Response): Promise<Response>{
        try{
            const {email, password}= req.body;
            const result = await authenticateUserService.execute({email,password});

            return res.json(result);

        }catch(error: any){
            return res.status(401).json({message: error.message});
        }
    }
}