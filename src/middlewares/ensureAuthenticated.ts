import { Request, Response, NextFunction } from 'express'; //NextFunction = função usada para passar para o próximo middleware
import jwt from 'jsonwebtoken';

interface IPayload{   //interface do token
    sub: string;  //id do usuario
    role: string;
}

export function ensureAuthenticated(   //essa função garante que o usuario esteja autenticado
    req: Request,
    res: Response,
    next: NextFunction
){
    const authHeader= req.headers.authorization;   //pega a autorizacao

    if(!authHeader){
        return res.status(401).json({message:'Token de autenticação não fornecido.'});
    }

    const [,token]= authHeader.split(' ');   //ignora o bearer 

    try{
        const secret = process.env.JWT_SECRET;
         if(!secret){
            throw new Error('JWT_SECRET não configurado')
        }

        const decoded = jwt.verify(token, secret) as IPayload;

        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };

        return next();  //ele diz ao Express "já terminei de processar a minha parte nesta requisição. Pode passar o controle para a proxima função na fila"
    }catch (err){
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
 
}