import { Request, Response, NextFunction } from 'express';

export function ensureAdmin(
    req: Request, 
    res: Response,
    next: NextFunction
){
    const {role} = req.user;

    if( role === 'ADMIN'){
        return next(); //é admin: chama o next() e passa o controle para a Controller/próxima etapa
    }
    return res.status(403).json({
        message: 'Acesso negado: Recursos restritos apenas para administradores.'
    });
}