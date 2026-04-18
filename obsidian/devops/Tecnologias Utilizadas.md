---
tags: [tecnologias, stack, dependências]
tipo: referência
relacionado: ["[[Visão Geral da Arquitetura]]", "[[Como Rodar o Projeto]]"]
criado: 2026-04-17
---

# 🛠️ Tecnologias Utilizadas

## Backend (`server/`)

| Pacote | Versão | Função |
|--------|--------|--------|
| `fastify` | ^5 | Framework HTTP ultra-rápido |
| `@fastify/cors` | ^11 | Habilita CORS para a LAN |
| `@fastify/jwt` | ^10 | Autenticação JWT |
| `@fastify/websocket` | ^11 | WebSocket nativo |
| `@prisma/client` | ^7 | ORM para SQLite |
| `@prisma/adapter-better-sqlite3` | ^7 | Driver adapter obrigatório no Prisma 7 |
| `better-sqlite3` | ^12 | Driver SQLite nativo |
| `bcryptjs` | ^3 | Hash seguro de senhas |
| `date-fns` | ^4 | Manipulação de datas (semana/mês) |
| `dotenv` | ^16 | Variáveis de ambiente |

## Frontend (`client/`)

| Pacote | Versão | Função |
|--------|--------|--------|
| `react` | ^19 | UI framework |
| `react-dom` | ^19 | Renderização DOM |
| `react-router-dom` | ^7 | Roteamento SPA |
| `axios` | ^1 | Cliente HTTP |
| `framer-motion` | ^12 | Animações suaves |
| `lucide-react` | ^1 | Ícones SVG |
| `date-fns` | ^4 | Formatação de datas |
| `tailwindcss` | ^4 | Estilização utility-first |
| `@tailwindcss/postcss` | ^4 | Plugin PostCSS do Tailwind v4 |
| `vite` | ^8 | Build tool e dev server |
| `typescript` | ~6 | Tipagem estática |

## Por Que Estas Escolhas?

### Fastify vs Express
- Fastify é ~2x mais rápido que Express
- Schema validation nativo
- Plugin system bem estruturado

### SQLite vs PostgreSQL/MySQL
- Zero infraestrutura (arquivo único)
- Fácil backup (copiar `dev.db`)
- Suficiente para LAN com poucos usuários

### Vite vs Create React App
- Build instantâneo com HMR
- Bundle de produção 10x menor
- Suporte nativo a TypeScript e ESM

### Framer Motion
- API declarativa para animações React
- `AnimatePresence` para animar saída de elementos
- `spring` physics para transições naturais

## Notas Relacionadas

- [[Visão Geral da Arquitetura]] — como as peças se encaixam
- [[Prisma 7 e SQLite]] — quirks do Prisma 7
- [[Como Rodar o Projeto]] — instalação
