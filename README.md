# Socket Chat App

Aplicação de chat em tempo real construída para praticar e demonstrar uma arquitetura em camadas (repository/service/controller) num backend Node.js, integrada com WebSockets para mensagens instantâneas.

> Projeto de portfólio — o foco é demonstrar organização de código, autenticação, e comunicação em tempo real com Socket.IO, não um produto de chat completo.

## Funcionalidades

- Registro e login (email/senha), com sessão protegida por cookie (better-auth)
- Rota `/chat` protegida via SSR — sessão validada no servidor antes de renderizar
- Adicionar amigos por e-mail
- Aceitar/recusar pedidos de amizade
- Enviar e receber mensagens em tempo real
- Histórico de conversa com paginação por cursor (carrega mensagens antigas ao rolar para o topo)

## Stack

**Backend (`apps/api`)**
- [Fastify](https://fastify.dev/) — servidor HTTP
- [Socket.IO](https://socket.io/) — comunicação em tempo real
- [Prisma](https://www.prisma.io/) + PostgreSQL — ORM e banco de dados
- [better-auth](https://www.better-auth.com/) — autenticação por sessão/cookie
- [Zod](https://zod.dev/) — validação de schemas

**Frontend (`apps/web`)**
- [Astro](https://astro.build/) (SSR, adapter Node standalone) — framework, com ilhas React para a UI interativa
- [React](https://react.dev/) — componentes do chat
- [shadcn/ui](https://ui.shadcn.com/) — componentes de interface, incluindo `Message`, `Bubble` e `MessageScroller` para o transcript do chat
- [Tailwind CSS](https://tailwindcss.com/) — estilos
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

**Infra**
- Docker / Docker Compose (3 serviços: `postgres`, `api`, `web`)

## Arquitetura

O backend segue uma separação em camadas por módulo de domínio (`user`, `friend`, `message`):

```
Request → Route → Controller → Service → Repository → Banco
```

- **Route** — declara o endpoint e aplica middlewares (ex: autenticação)
- **Controller** — valida entrada (Zod) e orquestra a resposta HTTP
- **Service** — regra de negócio (ex: só pode enviar mensagem para quem já é amigo)
- **Repository** — única camada que fala com o Prisma/banco

Erros de negócio são lançados como `AppError` (com `statusCode` e `code` embutidos) e capturados por um error handler global do Fastify — os controllers não fazem tratamento de erro manual.

Mensagens em tempo real seguem o mesmo `MessageService` usado pela rota REST de histórico — o socket é só uma porta de entrada a mais, não uma lógica duplicada.

### Estrutura de pastas

```
apps/
├── api/
│   ├── prisma/              # schema e migrations
│   └── src/
│       ├── modules/         # user, friend, message (repository/service/controller/routes)
│       ├── sockets/         # middleware de auth do socket e handlers de chat
│       ├── plugins/         # setup do Socket.IO sobre o Fastify
│       ├── shared/errors/   # AppError + error handler global
│       ├── shared/utils/    # schemas Zod reutilizáveis (params, query)
│       ├── types/           # augmentation do FastifyRequest.user
│       └── lib/auth.ts      # configuração do better-auth
└── web/
    ├── components/
    │   ├── chat/             # AddFriend, FriendList, FriendRequests, ChatWindow
    │   └── ui/                # componentes shadcn/ui
    ├── lib/
    │   ├── api/               # client HTTP por domínio (friends, messages, users)
    │   ├── auth.client.ts     # client do better-auth
    │   └── socket.ts          # client do Socket.IO
    └── src/pages/              # rotas Astro (login, register, chat com proteção SSR)
```

## Rodando localmente (sem Docker)

### Pré-requisitos
- Node.js 22+
- PostgreSQL (local ou via Docker, ver abaixo)

### 1. Banco de dados

```bash
docker run --name chat-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=chatdb \
  -p 5432:5432 -d postgres:16-alpine
```

### 2. Backend

```bash
cd apps/api
npm install
cp .env.example .env   # preencha as variáveis (veja abaixo)
npx prisma migrate dev
npm run dev
```
Servidor em `http://localhost:3333`.

### 3. Frontend

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```
Aplicação em `http://localhost:4321`.

## Variáveis de ambiente

**`apps/api/.env`**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatdb
BETTER_AUTH_SECRET=           # gere com: openssl rand -base64 32
BASE_URL=http://localhost:3333
CLIENT_URL=http://localhost:4321
PORT=3333
```

**`apps/web/.env`**
```
PUBLIC_API_URL=http://localhost:3333
```

## Rodando com Docker

```bash
cd apps
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" > .env
docker compose up --build
```
- Frontend: `http://localhost:4321`
- API: `http://localhost:3333`

### Sobre as duas URLs da API no ambiente Docker

O serviço `web` usa **duas** variáveis diferentes pra falar com a API, e a distinção importa:

- `PUBLIC_API_URL` — embutida no bundle do **navegador** em build time (`docker-compose.yml` passa via `build.args`). Precisa ser a URL que a máquina do usuário final alcança (`http://localhost:3333`).
- `INTERNAL_API_URL` — lida em **runtime**, usada só nas chamadas que rodam no servidor (checagem de sessão via SSR em `chat.astro`). Como essa checagem roda *dentro* do container `web`, `localhost:3333` apontaria pro próprio container, não pro `api` — por isso essa variável usa o nome do serviço na rede do Compose (`http://api:3333`).

Se só existisse `PUBLIC_API_URL`, a proteção de rota do `/chat` falharia silenciosamente ao rodar via Docker (redirecionaria sempre pro login), mesmo funcionando normalmente em `npm run dev` local.

## Visão geral da API

| Método | Rota | Descrição | Autenticado |
|---|---|---|---|
| POST | `/auth/register` | Cria conta | Não |
| POST | `/auth/login` | Login | Não |
| GET | `/user?email=` | Busca usuário por e-mail | Sim |
| POST | `/friends/request` | Envia pedido de amizade | Sim |
| POST | `/friends/:id/accept` | Aceita pedido | Sim |
| POST | `/friends/:id/reject` | Recusa pedido | Sim |
| GET | `/friends` | Lista amigos | Sim |
| GET | `/friends/requests` | Lista pedidos pendentes recebidos | Sim |
| GET | `/messages/:friend?cursor=&limit=` | Histórico paginado com um amigo | Sim |

Erros seguem o formato `{ error: string, code: string }`, com o `statusCode` HTTP correspondente (400 validação, 403 sem permissão, 404 não encontrado, 409 conflito de estado).

## Eventos de Socket.IO

A conexão é autenticada lendo o cookie de sessão do better-auth no handshake.

| Evento | Direção | Payload |
|---|---|---|
| `message:send` | cliente → servidor | `{ receiverId, content }` |
| `message:receive` | servidor → cliente | mensagem criada, enviada para o remetente e o destinatário |
| `message:error` | servidor → cliente | erro de validação ou de negócio (ex: destinatário não é amigo) |

## Limitações conhecidas e próximos passos

- Pedidos de amizade não chegam em tempo real (só ao recarregar a página ou após uma ação); só as mensagens usam o socket hoje
- Sem testes automatizados
- Sem CI configurado

## Licença

MIT