---
tags: [banco-de-dados, prisma, seed, usuário]
tipo: operacional
relacionado: ["[[Banco de Dados]]", "[[Autenticação JWT]]", "[[Como Rodar o Projeto]]"]
criado: 2026-04-17
---

# 🌱 Seed — Usuário Inicial

## O que é o Seed?

O arquivo `server/seed.js` cria o **primeiro usuário administrador** no banco de dados. Deve ser executado uma única vez após criar o banco.

## Executar

```bash
cd server
node seed.js
```

## Credenciais Criadas

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin123` |
| Nome | `Administrador` |

> [!warning] Troque a senha
> Em produção, altere a senha padrão após o primeiro login implementando uma rota de troca de senha.

## Código do Seed

```javascript
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs"; // via createRequire

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const user = await prisma.user.upsert({
  where: { username: "admin" },
  update: {},           // ← não atualiza se já existir
  create: {
    username: "admin",
    name: "Administrador",
    password: await bcrypt.hash("admin123", 10),
  },
});
```

O `upsert` garante que o seed é **idempotente** — pode ser rodado várias vezes sem duplicar usuários.

## Adicionar Mais Técnicos

Para criar outros técnicos, edite o seed ou crie uma rota protegida de cadastro:

```javascript
// Adicione ao seed.js para criar múltiplos técnicos:
const tecnicos = [
  { username: "joao", name: "João Silva", password: "senha123" },
  { username: "maria", name: "Maria Souza", password: "senha456" },
];

for (const t of tecnicos) {
  await prisma.user.upsert({
    where: { username: t.username },
    update: {},
    create: {
      ...t,
      password: await bcrypt.hash(t.password, 10),
    },
  });
}
```

## Notas Relacionadas

- [[Banco de Dados]] — estrutura da tabela User
- [[Autenticação JWT]] — como a senha é verificada
- [[Como Rodar o Projeto]] — quando executar o seed
