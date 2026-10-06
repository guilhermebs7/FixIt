import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface IValidateOptions {
  body?: ZodSchema;    //opcional fornecer um schema para validar os atributos
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validateSchema({ body, params, query }: IValidateOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (body) {   //foi passado um schema para validar o body?
        req.body = await body.parseAsync(req.body);  // pegue o req.body e valide usando esse schema
      }
      if (params) {
         await params.parseAsync(req.params);
      }
      if (query) {
         await query.parseAsync(req.query);
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Erro de validação nos dados enviados.',
          errors: error.issues.map((issue) => ({  // o zod guarda os erros em errors e .map percorre por cada um deles
            field: issue.path.join('.'),  //informa onde ocorreu o erro
            message: issue.message,
          })),
        });
      }

      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  };
}