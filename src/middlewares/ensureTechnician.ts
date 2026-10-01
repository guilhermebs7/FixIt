import { Request, Response, NextFunction } from 'express';

export function ensureTechnician(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { role } = req.user;

  
  if (role === 'TECNICO' || role === 'ADMINISTRADOR') {
    return next();
  }

  return res.status(403).json({
    message: 'Acesso negado: Apenas técnicos podem realizar esta operação.',
  });
}