//serve basicamente para dizer ao TypeScript que req.user existe, normalmente temos req,res . Mas o express não conhece req.user = "no meu projeto o req também tera um user" ou seja queremos guardar quem está logado dentro do req
declare namespace Express {
  export interface Request {
    user: {
      id: string;
      role: string;
    };
  }
}