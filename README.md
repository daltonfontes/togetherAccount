# Together Account

Plataforma SaaS de controle financeiro compartilhado para casais, famílias e pessoas
que moram juntas. Permite gerenciar receitas, despesas, contas bancárias, cartões de
crédito, divisão de contas, orçamentos, metas financeiras, convites de moradores,
notificações e auditoria em um único lugar — com tema claro/escuro e layout responsivo.

## Arquitetura

Monorepo com dois aplicativos independentes que se comunicam via API REST, mais uma
stack de observabilidade completa:

```
togetherAccount/
├── backend/          NestJS + TypeScript + TypeORM + PostgreSQL API
├── frontend/          Vue 3 + Vite dashboard SPA
├── observability/     Configs do Prometheus, Grafana, Loki e Tempo
└── docker-compose.yml Orquestração de todos os serviços
```

### Backend (`/backend`)

- **NestJS + TypeScript**, organizado em módulos de domínio (`auth`, `users`,
  `households`, `bank-accounts`, `credit-cards`, `categories`, `transactions`,
  `budgets`, `goals`, `notifications`, `audit`, `reports`, `health`).
- **PostgreSQL via TypeORM**, com migrations versionadas em vez de `synchronize`.
- **Autenticação** JWT de acesso (15 min) + refresh token rotativo (7 dias),
  hashing de senha com **Argon2**, estratégias Passport, guardas de papel por casa
  (`owner` / `admin` / `member`). Login com **Google (OAuth 2.0)** opcional —
  desativado por padrão, habilita ao definir `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/
  `GOOGLE_CALLBACK_URL`. **Magic link** (login sem senha por e-mail, token de
  uso único com expiração de 15 min) sempre disponível — cria a conta
  automaticamente no primeiro acesso; depende de `RESEND_API_KEY` para o
  e-mail sair de verdade (ver seção de variáveis de ambiente).
- **Redis + BullMQ** para jobs assíncronos: geração de transações recorrentes,
  alertas de orçamento/fatura e envio de e-mails de convite via **Resend** —
  opcional, sem `RESEND_API_KEY` os e-mails só são logados, não enviados.
- **Observabilidade**: logs estruturados com Winston, tracing distribuído via
  OpenTelemetry (OTLP), métricas Prometheus em `/api/metrics`, health checks em
  `/api/health` (Terminus).
- **Segurança e robustez**: Helmet, compressão, CORS configurável, rate limiting
  (`@nestjs/throttler`), validação de DTOs com `class-validator`/`class-transformer`,
  filtro global de exceções, serialização automática (senhas nunca vazam nas
  respostas).
- **Documentação**: Swagger/OpenAPI disponível em `/docs` quando a API está no ar.

### Frontend (`/frontend`)

- **Vue 3 (Composition API, `<script setup>`) + Vite + TypeScript**, SPA
  client-side roteada com **Vue Router** (sem SSR — não há necessidade de SEO
  num dashboard autenticado).
- **TailwindCSS** com tema claro/escuro via composable próprio (`useTheme`,
  design tokens em `globals.css`, alternância manual ou automática pelo sistema).
- Componentes de UI no estilo **shadcn/ui** sobre **Reka UI** (fork Vue do
  Radix UI) + `class-variance-authority`, totalmente responsivos.
- **TanStack Query** (`@tanstack/vue-query`) para cache/sincronização de dados
  do servidor, **Pinia** para estado de sessão (token, casa selecionada) com
  persistência em `localStorage`, **VeeValidate + Zod** para formulários
  validados.
- **Chart.js** (via `vue-chartjs`) para os gráficos do dashboard e relatórios
  (fluxo de caixa, despesas por categoria, gastos por pessoa), com paleta de
  cores validada para acessibilidade (contraste e daltonismo) em ambos os
  temas.
- **Axios** com interceptor de refresh token automático (renova a sessão em caso
  de 401 e repete a requisição original).

### Observabilidade (`/observability`)

- **Prometheus** coleta métricas HTTP, de jobs e de runtime do Node.js.
- **Grafana** já provisionado com datasources (Prometheus, Loki, Tempo) e um
  dashboard inicial (`Together Account · API Overview`).
- **Loki + Promtail** centralizam os logs de todos os containers.
- **Tempo** recebe traces distribuídos via OTLP HTTP diretamente do backend.

## Modelo de dados (visão geral)

`User` → participa de várias `Household` através de `HouseholdMember` (papéis
owner/admin/member). Cada `Household` possui `BankAccount`s, `CreditCard`s,
`Category`s, `Transaction`s (com `TransactionSplit` para divisão de contas),
`Budget`s (limite mensal por categoria) e `Goal`s (com `GoalContribution`).
`Invite` controla convites pendentes por e-mail. `Notification` e `AuditLog`
registram eventos por usuário/casa para histórico de alterações.

## Como rodar localmente

### Opção 1 — Docker Compose (recomendado)

Sobe banco de dados, cache, API, frontend e toda a stack de observabilidade:

```bash
docker compose up --build
```

| Serviço              | URL                              |
| --------------------- | --------------------------------- |
| Frontend               | http://localhost:3000            |
| API                     | http://localhost:3001/api        |
| Swagger (OpenAPI)       | http://localhost:3001/docs       |
| Prometheus              | http://localhost:9090            |
| Grafana                 | http://localhost:3300 (anônimo/admin) |
| Tempo (query API)       | http://localhost:3200            |

Defina `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` no ambiente antes de subir em
qualquer ambiente que não seja puramente local (o compose usa valores padrão de
desenvolvimento caso não sejam definidos).

### Opção 2 — Rodando cada app manualmente

Pré-requisitos: Node.js 22+, PostgreSQL 16+, Redis 7+.

```bash
# Backend
cd backend
cp .env.example .env      # ajuste host/porta/segredos do Postgres e Redis
npm install
npm run migration:run
npm run seed               # opcional: cria usuário demo@togetheraccount.app / Demo@12345
npm run start:dev          # http://localhost:3001

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## Testes

```bash
cd backend
npm test          # suíte Jest (auth, transactions, budgets)

cd frontend
npm run lint
npm run typecheck
npm run test       # suíte Vitest (auth guard, refresh de token)
npm run build      # build de produção completo
```

## Variáveis de ambiente

Consulte `backend/.env.example` e `frontend/.env.example` para a lista completa.
Destaques:

- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: segredos usados para assinar os
  tokens — **gere valores aleatórios longos em produção**.
- `DB_SYNCHRONIZE`: deve permanecer `false`; o schema é controlado por migrations.
- `OTEL_EXPORTER_OTLP_ENDPOINT`: endpoint OTLP HTTP para onde os traces são
  enviados (Tempo, por padrão, no compose).
- `VITE_API_URL`: URL base da API consumida pelo frontend (definida em build-time,
  já que o frontend é uma SPA estática servida por nginx).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL`: opcionais;
  login com Google fica desativado (rotas `/auth/google` respondem 503) até os
  três estarem definidos. Credenciais em
  https://console.cloud.google.com/apis/credentials.
- `RESEND_API_KEY` / `EMAIL_FROM`: opcionais; sem `RESEND_API_KEY`, e-mails
  (convite de morador) só são logados, não enviados de verdade. Chave em
  https://resend.com/api-keys — o remetente sandbox padrão
  (`onboarding@resend.dev`) só entrega pro e-mail da própria conta Resend;
  verifique um domínio em https://resend.com/domains para enviar a usuários
  reais.

