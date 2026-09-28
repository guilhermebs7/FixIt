import {PrismaClient} from '@prisma/client';   //objeto que permite o codigo conversar com o banco de dados
import fs from 'fs';                           //significa File System, e um modulo do Node.js usado para trabalhar com arquivos.
import path from 'path';                       //ajuda a trabalhar com caminhos de arquivos de forma segura
import 'dotenv/config';


function getDatabaseUrl(): string{          //descobrir qual será a URL usada para conectar com o bd, : string = siginfica que a funcao retorna uma string
    if(process.env.DATABASE_URL){           //verifica se existe uma variavelde ambiente chamada DATABASE_URL, process.env é onde o node disponibiliza as variaveis de ambiente
        return process.env.DATABASE_URL;
    }


    const secretPath = path.resolve(process.cwd(), 'db_password.txt');


    if(!fs.existsSync(secretPath)){       //verifica se o arquivo existe
        throw new Error('O ficheiro db_password.txt não foi encontrado na raiz do projeto');
    }
  const password = fs.readFileSync(secretPath, 'utf-8').trim();  //fs.read lê o conteudo do arquivo , utf-8 diz para interpretar o conteudo do arquivo como texto
  const user = process.env.DB_USER || 'fixit_user';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || 'fixit_db';


  return `postgresql://${user}:${password}@${host}:${port}/${dbName}?schema=public`;
}
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});
