import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FixIt API',
      version: '1.0.0',
      description: 'API para gestão de chamados de manutenção e equipamentos com controle de acesso por perfil (RBAC).',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor Local de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT no formato: Bearer <seu_token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts'], // mapeia onde o Swagger deve procurar as anotações e rotas JSDoc
};

export const swaggerSpec = swaggerJSDoc(options);    //execute o Swagger usando as configurações options e guarde o resultado na variável swaggerSpec , para que outras partes da aplicação possam usá-lo