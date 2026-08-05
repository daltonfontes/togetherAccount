# frontend-vue

Rewrite do frontend do Together Account em Vue 3 + Vite, substituindo o app Next.js/React em `frontend/`.

Enquanto o rewrite está em andamento, `frontend/` continua sendo o app em produção — este diretório só é promovido a `frontend/` no PR de corte final.

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
- `npm run preview` — serve o build de produção localmente
