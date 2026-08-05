# frontend

Frontend do Together Account — Vue 3 + Vite + TypeScript, consumindo a API do
`backend/` via REST.

## Desenvolvimento

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm run dev
```

## Scripts

- `npm run dev` — servidor de desenvolvimento (Vite)
- `npm run build` — typecheck (`vue-tsc`) + build de produção
- `npm run lint` — ESLint
- `npm run typecheck` — apenas o typecheck
- `npm run test` — suíte Vitest
- `npm run preview` — serve o build de produção localmente
