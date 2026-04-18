---
tags: [banco-de-dados, sqlite, prisma, schema]
tipo: banco-dados
relacionado: ["[[Prisma 7 e SQLite]]", "[[Servidor Fastify]]", "[[Visão Geral da Arquitetura]]"]
criado: 2026-04-17
---

# 🗄️ Banco de Dados

O sistema usa **SQLite** via **Prisma 7** com Driver Adapter `better-sqlite3`.

## Localização

```
server/dev.db       ← arquivo único do banco (não commitado no git)
```

## Schema (Prisma)

```prisma
model User {
  id        String              @id @default(uuid())
  name      String
  username  String              @unique
  password  String              // bcrypt hash
  records   TemperatureRecord[]
  createdAt DateTime            @default(now())
}

model TemperatureRecord {
  id        String   @id @default(uuid())
  value     Float              // 28.5
  createdAt DateTime @default(now())  // gravado pelo SERVIDOR
  user      User     @relation(fields: [userId], references: [id])
  userId    String
}
```

## Tabelas

### `User`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária auto-gerada |
| `name` | String | Nome exibido nos relatórios |
| `username` | String UNIQUE | Login do técnico |
| `password` | String | Hash bcrypt (nunca texto puro) |
| `createdAt` | DateTime | Data de criação |

### `TemperatureRecord`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária auto-gerada |
| `value` | Float | Temperatura em graus Celsius |
| `userId` | FK → User | Técnico que registrou |
| `createdAt` | DateTime | Timestamp automático |

## Decisões de Design

> [!note] Por que SQLite?
> - Não precisa de processo de servidor separado
> - Arquivo único → fácil backup (copiar `dev.db`)
> - Suporta centenas de acessos simultâneos em LAN
> - Zero configuração de infraestrutura

> [!warning] Backup
> O arquivo `dev.db` **não está no GitHub**. Faça cópias manuais regulares ou configure um script de backup automático.

## Queries Importantes

### Último registro (para painéis)
```typescript
prisma.temperatureRecord.findFirst({
  orderBy: { createdAt: "desc" },
  include: { user: { select: { name: true } } },
})
```

### Relatório semanal
```typescript
prisma.temperatureRecord.findMany({
  where: {
    createdAt: {
      gte: startOfWeek(now, { weekStartsOn: 1 }),  // segunda-feira
      lte: endOfWeek(now, { weekStartsOn: 1 }),
    },
  },
  include: { user: { select: { name: true } } },
  orderBy: { createdAt: "desc" },
})
```

## Notas Relacionadas

- [[Prisma 7 e SQLite]] — configuração do ORM
- [[Seed - Usuário Inicial]] — como criar o primeiro usuário
