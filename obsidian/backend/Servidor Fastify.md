---
tags: [backend, fastify, api, rotas]
tipo: backend
relacionado: ["[[Rotas da API]]", "[[Autenticação JWT]]", "[[WebSocket em Tempo Real]]", "[[Prisma 7 e SQLite]]"]
criado: 2026-04-17
---

# ⚡ Servidor Fastify

## Localização

```
server/index.js
```

## Setup Inicial

```javascript
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import websocket from "@fastify/websocket";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const fastify = Fastify({ logger: false });

await fastify.register(cors, { origin: "*" });
await fastify.register(jwt, { secret: "poolcontrol-secret-2024" });
await fastify.register(websocket);
```

> [!warning] Prisma 7
> A versão 7 do Prisma **obriga** o uso de Driver Adapters. Não é possível passar `datasourceUrl` diretamente no construtor — precisa do `PrismaBetterSqlite3`.

## Porta

O servidor escuta na porta **3001** em todas as interfaces (`0.0.0.0`), permitindo acesso de qualquer máquina na rede local.

```javascript
await fastify.listen({ port: 3001, host: "0.0.0.0" });
```

## Middlewares

### CORS
Aberto para `"*"` — aceita requisições de qualquer origem (necessário para LAN).

### JWT Hook (preHandler)
Verifica token em todas as rotas exceto:
- `POST /auth/login`
- `GET /temperature/latest`
- `GET /ws`

## Como Iniciar

```bash
cd server
node index.js
```

Saída esperada:
```
✅ PoolControl Server → http://localhost:3001
```

## Notas Relacionadas

- [[Rotas da API]] — endpoints disponíveis
- [[Autenticação JWT]] — proteção das rotas
- [[WebSocket em Tempo Real]] — broadcast para painéis
- [[Prisma 7 e SQLite]] — detalhes do ORM
