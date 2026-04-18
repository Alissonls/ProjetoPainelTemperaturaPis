---
tags: [devops, estrutura, pastas, arquivos]
tipo: referência
relacionado: ["[[Tecnologias Utilizadas]]", "[[Como Rodar o Projeto]]"]
criado: 2026-04-17
---

# 📁 Estrutura de Pastas

```
ProjetoPainelTemperaturaPis/
│
├── 📄 .gitignore              # exclui node_modules, dev.db, .env
├── 📄 README.md               # documentação inicial
│
├── obsidian/                  # este vault Obsidian
│   ├── 🗺️ Mapa do Projeto.md
│   ├── arquitetura/
│   ├── backend/
│   ├── banco-de-dados/
│   ├── frontend/
│   └── devops/
│
├── server/                    # Backend (Node.js)
│   ├── index.js               # ← ponto de entrada do servidor
│   ├── seed.js                # ← cria usuário admin inicial
│   ├── dev.db                 # banco de dados SQLite (não no git)
│   ├── .env                   # DATABASE_URL
│   ├── prisma.config.ts       # configuração do Prisma 7
│   ├── package.json
│   └── prisma/
│       └── schema.prisma      # ← definição das tabelas
│
└── client/                    # Frontend (React)
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js     # (removido — Tailwind v4 não usa)
    ├── postcss.config.js      # usa @tailwindcss/postcss
    ├── package.json
    └── src/
        ├── main.tsx           # ponto de entrada React
        ├── App.tsx            # roteamento (react-router-dom)
        ├── api.ts             # axios instance com JWT header
        ├── index.css          # @import "tailwindcss"
        └── pages/
            ├── Login.tsx      # tela de autenticação
            ├── Dashboard.tsx  # registro de temperatura
            ├── Panel.tsx      # painel público (TVs)
            └── Reports.tsx    # relatórios semanal/mensal
```

## Arquivos Críticos

| Arquivo | Por Quê É Crítico |
|---------|-------------------|
| `server/index.js` | Toda a lógica do backend |
| `server/dev.db` | O banco de dados em produção |
| `server/prisma/schema.prisma` | Estrutura das tabelas |
| `client/src/api.ts` | Centraliza o baseURL e o token |
| `client/src/pages/Panel.tsx` | Endereço do WebSocket |

## O Que NÃO Está no GitHub

- `node_modules/` (gerado via `npm install`)
- `dev.db` (dados de produção)
- `.env` (configurações sensíveis)
- `client/dist/` (build de produção)

## Notas Relacionadas

- [[Como Rodar o Projeto]] — comandos de instalação
- [[Git e GitHub]] — repositório remoto
- [[Banco de Dados]] — sobre o dev.db
