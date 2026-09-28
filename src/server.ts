import express from 'express';   //importando o express pra dentro do ccódigo
import { prisma } from './config/prisma';

const app = express();   //executando o express e guardando o resultado na variável app, podemos dizer que o app é o servidor

app.use(express.json());  // essa linha é um middleware o express.json serve principalmente para permitir que o Express entenda o JSON enviado no corpo da requisição.

app.get('/health',(req,res)=>{
    return res.json({status: 'ok', message: 'FixIt API rodando com sucesso!'}); //tem o caminho da requisição get e uma mensagem de retorno.
});

const PORT= process.env.PORT || 3333;   // definindo em qual porta o servidor vai rodar;

app.listen(PORT,()=>{
    console.log(`servidor rodando na porta ${PORT}`);
});

prisma.$connect()
  .then(() => console.log('Banco conectado'))
  .catch((error) => {
    console.error('Erro ao conectar ao banco:', error);
    process.exit(1);
  });