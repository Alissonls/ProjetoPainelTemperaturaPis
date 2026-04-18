---
tags: [banco-de-dados, prisma, orm, sqlite, driver-adapter]
tipo: backend
relacionado: ["[[Banco de Dados]]", "[[Servidor Fastify]]", "[[Seed - Usuário Inicial]]"]
criado: 2026-04-17
---

# 🔷 Prisma 7 e SQLite

## Breaking Change: Driver Adapters Obrigatórios

O Prisma 7 removeu o suporte a `datasourceUrl` no construtor e exige **Driver Adapters** para todas as conexões.

> [!warning] Não funciona mais no Prisma 7
> ```javascript
> // ❌ DEPRECATED — não use no Prisma 7
> const prisma = new PrismaClient({ datasourceUrl: "file:./dev.db" });
> ```

## Configuração Correta

### 1. Instalar o adapter

```bash
npm install @prisma/adapter-better-sqlite3 better-sqlite3
```

### 2. Usar no código

```javascript
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
// ⚠️ Atenção: "Sqlite3" com 's' minúsculo — não "SQLite3"

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });
```

### 3. Schema sem URL hardcoded

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  // URL gerenciada pelo prisma.config.ts
}
```

### 4. prisma.config.ts (gerado automaticamente)

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env["DATABASE_URL"], // file:./dev.db
  },
});
```

## Comandos Úteis

```bash
# Criar/atualizar tabelas (sem migrations)
npx prisma db push

# Regenerar o Prisma Client
npx prisma generate

# Abrir o Prisma Studio (interface visual)
npx prisma studio
```

## Nome do Export (Atenção!)

```javascript
// ✅ Correto
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// ❌ Errado (SQLite com maiúsculas)
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
```

## Notas Relacionadas

- [[Banco de Dados]] — estrutura do schema
- [[Servidor Fastify]] — onde o PrismaClient é instanciado
- [[Seed - Usuário Inicial]] — usa o mesmo padrão de adapter
