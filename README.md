# 🔧 FixIt — API de Gestão de Chamados de Manutenção

![Node.js](https://img.shields.io/badge/NODE.JS-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TYPESCRIPT-STRICT-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/EXPRESS-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/PRISMA-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/POSTGRESQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker Compose](https://img.shields.io/badge/DOCKER-COMPOSE-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-AUTH-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Bcrypt](https://img.shields.io/badge/BCRYPTJS-HASH-8E44AD?style=for-the-badge)
![Zod](https://img.shields.io/badge/ZOD-VALIDATION-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Swagger](https://img.shields.io/badge/SWAGGER-OPENAPI%203.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Vitest](https://img.shields.io/badge/VITEST-5-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![tsup](https://img.shields.io/badge/TSUP-BUILD-EF4444?style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GITHUB%20ACTIONS-CI-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

---

## 📖 Sobre o projeto

O **FixIt** é uma API REST para **gestão de chamados (tickets) de manutenção de equipamentos**, com **controle de acesso por perfil (RBAC)**.

A ideia: um usuário percebe que um equipamento (notebook, impressora, projetor etc.) está com defeito e abre um **chamado**. Um **técnico** assume o atendimento, registra as **manutenções** realizadas (descrição, custo, datas) e, ao finalizar, o chamado é concluído automaticamente. Administradores gerenciam os cadastros.

### Principais funcionalidades

- 🔐 **Autenticação JWT** com senha criptografada (bcrypt)
- 👥 **Três perfis de acesso:** `ADMINISTRADOR`, `TECNICO` e `USUARIO`
- 🖥️ **Cadastro de equipamentos** com número de tombamento único
- 🎫 **Abertura e acompanhamento de chamados** (status, prioridade, técnico responsável)
- 🛠️ **Registro de manutenções** com custo e período de execução
- ✅ **Validação de entrada** com Zod (mensagens de erro por campo)
- 📚 **Documentação interativa** via Swagger UI
- 🧪 **Testes automatizados** com Vitest
- ⚙️ **Pipeline de CI** no GitHub Actions

---

## 🛠️ Tecnologias utilizadas

| Categoria | Tecnologia |
|---|---|
| Linguagem | TypeScript (modo `strict`) |
| Runtime | Node.js 20 |
| Framework web | Express 5 |
| ORM | Prisma 6 |
| Banco de dados | PostgreSQL 15 (Alpine) |
| Infraestrutura local | Docker Compose (com Docker Secrets) |
| Autenticação | JWT (`jsonwebtoken`) + `bcryptjs` |
| Validação | Zod 4 |
| Documentação | `swagger-jsdoc` + `swagger-ui-express` (OpenAPI 3.0) |
| Testes | Vitest 5 |
| Build / Dev | `tsup` (build) e `tsx` (modo watch) |
| CI | GitHub Actions |

---

## 🗂️ Estrutura do projeto

```
FixIt/
├── .github/workflows/ci.yml     # Pipeline de CI
├── prisma/
│   ├── schema.prisma            # Modelagem do banco
│   └── migrations/              # Histórico de migrations
├── src/
│   ├── config/                  # Prisma Client e Swagger
│   ├── routes/                  # Definição das rotas (+ docs Swagger)
│   ├── controllers/             # Recebem a requisição e devolvem a resposta HTTP
│   ├── services/                # Regras de negócio e acesso ao banco
│   ├── middlewares/             # Autenticação, autorização e validação
│   ├── schemas/                 # Schemas Zod
│   ├── types/                   # Tipagens (ex.: req.user)
│   └── server.ts                # Ponto de entrada da aplicação
├── tests/
│   ├── controllers/
│   ├── services/
│   └── middlewares/
├── docker-compose.yml
├── prisma.config.ts
└── vitest.config.ts
```

O projeto segue uma arquitetura em camadas: **Route → Middleware → Controller → Service → Prisma → PostgreSQL**.

---

## 🗃️ Modelo de dados

| Entidade | Descrição |
|---|---|
| **User** | Nome, e-mail único, senha (hash) e `role` (`ADMINISTRADOR`, `TECNICO`, `USUARIO`) |
| **Equipamento** | Nome, tombamento único, tipo, marca, modelo, localização e status (padrão `ATIVO`) |
| **Ticket** | Título, descrição, prioridade (`Baixa`, `MEDIA`, `HIGH`), status, equipamento, solicitante e técnico (opcional) |
| **Manutencao** | Ticket, técnico, descrição, custo, `startedAt` e `finishedAt` |

**Relacionamentos**

- Um **User** pode solicitar vários **Tickets** e ser técnico de vários **Tickets**.
- Um **Equipamento** pode ter vários **Tickets**.
- Um **Ticket** pode ter várias **Manutenções**.
- Um **User** (técnico) pode registrar várias **Manutenções**.

**Status do chamado:** `ABERTO` → `EM_PROGRESSO` → `COMPLETO` (ou `CANCELADO`)

---

## 🔄 Fluxo do projeto

### 1. Autenticação

```
Cadastro (POST /users)  →  Login (POST /sessions)  →  Recebe token JWT (validade de 1 dia)
                                                          │
                                  Authorization: Bearer <token> nas demais rotas
```

1. O usuário se cadastra em `POST /users` (a senha é salva com hash bcrypt e **nunca** é devolvida pela API).
2. Faz login em `POST /sessions` com e-mail e senha.
3. A API devolve o **token JWT**, que carrega o `id` (campo `sub`) e a `role` do usuário.
4. O middleware `ensureAuthenticated` valida o token em todas as rotas protegidas e preenche `req.user`.

### 2. Ciclo de vida de um chamado

```
┌──────────────┐   ┌─────────────────┐   ┌──────────────────┐   ┌──────────────┐
│ 1. Cadastro  │ → │ 2. Abertura do  │ → │ 3. Técnico       │ → │ 4. Finaliza  │
│ do           │   │ chamado         │   │ registra         │   │ manutenção   │
│ equipamento  │   │ (ABERTO)        │   │ manutenção       │   │ (COMPLETO)   │
│              │   │ POST /tickets   │   │ (EM_PROGRESSO)   │   │              │
└──────────────┘   └─────────────────┘   └──────────────────┘   └──────────────┘
 POST /equipamentos                        POST /manutencoes       PATCH /manutencoes/:id/finish
```

1. **Equipamento cadastrado:** o tombamento precisa ser único.
2. **Chamado aberto:** qualquer usuário autenticado abre um chamado vinculado a um equipamento existente. O solicitante é extraído do token e o status inicia como `ABERTO`.
3. **Manutenção registrada:** um técnico (ou administrador) registra a manutenção. Se o chamado estava `ABERTO`, ele muda automaticamente para `EM_PROGRESSO` e o técnico é atribuído.
4. **Manutenção finalizada:** ao finalizar, a manutenção recebe a data de término e o chamado passa para `COMPLETO`.

O status também pode ser alterado manualmente em `PATCH /tickets/:id/status` (inclusive para `CANCELADO`), com opção de atribuir um técnico.

### 3. Pipeline de cada requisição

```
Requisição → ensureAuthenticated → (ensureTechnician / ensureAdmin) → validateSchema (Zod) → Controller → Service → Prisma → PostgreSQL
```

---

## 🔐 Perfis e permissões

| Recurso | USUARIO | TECNICO | ADMINISTRADOR |
|---|:---:|:---:|:---:|
| Login e cadastro | ✅ | ✅ | ✅ |
| Abrir e consultar chamados | ✅ | ✅ | ✅ |
| Consultar/criar/editar equipamentos | ✅ | ✅ | ✅ |
| Registrar e finalizar manutenções | ❌ | ✅ | ✅ |
| Excluir equipamentos | ❌ | ❌ | ✅ |

---

## 🌐 Endpoints

| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| GET | `/health` | Pública | Verifica se a API está no ar |
| POST | `/sessions` | Pública | Login (retorna token JWT) |
| POST | `/users` | Pública | Cria usuário |
| GET | `/users` | Pública | Lista usuários |
| GET | `/users/:id` | Pública | Busca usuário por ID |
| PUT | `/users/:id` | Pública | Atualiza usuário |
| DELETE | `/users/:id` | Pública | Remove usuário |
| POST | `/equipamentos` | JWT | Cadastra equipamento |
| GET | `/equipamentos` | JWT | Lista equipamentos |
| GET | `/equipamentos/:id` | JWT | Busca equipamento por ID |
| PUT | `/equipamentos/:id` | JWT | Atualiza equipamento |
| DELETE | `/equipamentos/:id` | JWT + Admin | Remove equipamento |
| POST | `/tickets` | JWT | Abre chamado |
| GET | `/tickets` | JWT | Lista chamados |
| GET | `/tickets/:id` | JWT | Busca chamado por ID |
| PATCH | `/tickets/:id/status` | JWT | Atualiza status (e técnico) |
| POST | `/manutencoes` | JWT + Técnico | Registra manutenção |
| GET | `/manutencoes/ticket/:ticketId` | JWT | Lista manutenções de um chamado |
| PATCH | `/manutencoes/:id/finish` | JWT + Técnico | Finaliza manutenção |
| GET | `/api-docs` | Pública | Documentação Swagger |

---

## 🚀 Como executar

### Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) e Docker Compose

### Passo a passo

**1. Clone o repositório**

```bash
git clone https://github.com/<seu-usuario>/FixIt.git
cd FixIt
```

**2. Instale as dependências**

```bash
npm install
```

**3. Crie o arquivo de senha do banco** (usado pelo Docker Secrets e ignorado pelo Git)

```bash
echo "sua_senha_segura" > db_password.txt
```

**4. Suba o PostgreSQL**

```bash
docker compose up -d
```

> O banco fica disponível na porta **5433** do host (usuário `fixit_user`, banco `fixit_db`).

**5. Configure as variáveis de ambiente** — crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://fixit_user:sua_senha_segura@localhost:5433/fixit_db?schema=public"
JWT_SECRET="troque-por-um-segredo-forte"
PORT=3333
```

**6. Gere o Prisma Client e rode as migrations**

```bash
npm run db:generate
npm run db:migrate
```

**7. Inicie a aplicação**

```bash
npm run dev
```

A API estará em `http://localhost:3333` e a documentação em **`http://localhost:3333/api-docs`**.

### Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia em modo desenvolvimento (com watch) |
| `npm run build` | Compila o projeto para `dist/` |
| `npm start` | Executa a versão compilada |
| `npm test` | Executa os testes uma vez |
| `npm run test:watch` | Executa os testes em modo watch |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Executa as migrations em desenvolvimento |
| `npm run db:studio` | Abre o Prisma Studio |

---

## 🧪 Testes

Os testes são **unitários** e usam **Vitest**. Todas as dependências externas (banco de dados, JWT, bcrypt) são substituídas por **mocks** (`vi.mock` / `vi.fn`), então **não é necessário banco de dados rodando** para executar a suíte.

```bash
npm test
```

### O que é testado (32 testes)

| Camada | Arquivos | O que valida |
|---|---|---|
| **Services** (16) | `AuthenticateUserService`, `EquipamentoService`, `TicketService`, `ManutencaoService`, `UserService` | Regras de negócio: login com credenciais válidas/inválidas, falha sem `JWT_SECRET`, tombamento duplicado, e-mail duplicado, senha com hash e omitida na resposta, ticket só para equipamento existente, início automático do ticket ao criar manutenção, conclusão do ticket ao finalizar manutenção |
| **Controllers** (11) | `AuthenticateUserController`, `EquipamentoController`, `TicketController`, `ManutencaoController`, `UserController` | Códigos HTTP corretos (`200`, `201`, `204`, `401`, `404`), repasse correto dos dados da requisição ao service, uso do usuário autenticado (`req.user`) e conversão de tipos (custo e datas) |
| **Middlewares** (5) | `middlewares.test.ts` | Token válido popula `req.user`, rejeição de token ausente/inválido (`401`) e bloqueio por perfil (`403`) |

### Estratégia

- **Services:** o Prisma é mockado para testar apenas a lógica de negócio.
- **Controllers:** o service é mockado; verifica-se se o controller chama o service com os argumentos certos e responde com o status correto.
- **Middlewares:** `jsonwebtoken` é mockado para simular tokens válidos e inválidos.

---

## ⚙️ Integração Contínua (CI)

A cada `push` ou `pull request` nas branches `main`, `master` e `develop`, o GitHub Actions executa:

1. Checkout do código
2. Configuração do Node.js 20 (com cache do npm)
3. `npm ci` — instalação das dependências
4. `npx prisma generate` — geração do Prisma Client
5. `npm run build` — validação da compilação TypeScript

---

## 🔒 Segurança

- Senhas armazenadas com **hash bcrypt**
- Senha **nunca** retornada nas respostas da API
- Autenticação **stateless** via JWT (expira em 1 dia)
- Segredos (`.env` e `db_password.txt`) **ignorados pelo Git**
- Senha do banco no Docker via **Docker Secrets**
- Validação de todos os dados de entrada com **Zod**

