---
tags: [backend, autenticação, jwt, segurança]
tipo: segurança
relacionado: ["[[Servidor Fastify]]", "[[Rotas da API]]", "[[Banco de Dados]]", "[[Página de Login]]"]
criado: 2026-04-17
---

# 🔐 Autenticação JWT

## Como Funciona

O sistema usa **JSON Web Tokens (JWT)** para autenticar técnicos.

```
1. Técnico → POST /auth/login { username, password }
2. Servidor → bcrypt.compare(password, hash_do_banco)
3. Servidor → jwt.sign({ id, name, username }, { expiresIn: "8h" })
4. Cliente  → salva token no localStorage
5. Cliente  → envia "Authorization: Bearer <token>" em toda requisição protegida
6. Servidor → jwtVerify() no hook preHandler
```

## Segurança das Senhas

As senhas são **nunca armazenadas em texto puro**. O sistema usa `bcryptjs`:

```javascript
// Ao criar usuário (seed)
const hash = await bcrypt.hash("admin123", 10); // 10 = salt rounds

// Ao fazer login
const ok = await bcrypt.compare(password, user.password);
```

## JWT Payload

```json
{
  "id": "uuid-do-usuario",
  "name": "Administrador",
  "username": "admin",
  "iat": 1713000000,
  "exp": 1713028800  // 8 horas depois
}
```

## Hook de Proteção (preHandler)

```javascript
fastify.addHook("preHandler", async (request, reply) => {
  const PUBLIC_ROUTES = ["/auth/login", "/temperature/latest", "/ws"];
  const isPublic = PUBLIC_ROUTES.some(r => request.url.startsWith(r));
  
  if (isPublic || request.method === "OPTIONS") return;
  
  try {
    await request.jwtVerify();
    // request.user agora contém o payload do JWT
  } catch {
    return reply.status(401).send({ message: "Não autorizado" });
  }
});
```

## Por Que os Painéis São Públicos?

A rota `/temperature/latest` e `/ws` são **intencionalmente públicas** — os painéis de exibição não precisam de login para mostrar a temperatura. Eles são telas de visualização passiva.

## Validade do Token

- **Duração**: 8 horas
- **Armazenamento**: `localStorage` do navegador
- **Renovação**: Re-login necessário após expirar

> [!tip] Melhoria Futura
> Para maior segurança, implementar **refresh tokens** e armazenamento em httpOnly cookie em vez de localStorage.

## Notas Relacionadas

- [[Página de Login]] — interface de autenticação
- [[Rotas da API]] — quais rotas exigem token
- [[Servidor Fastify]] — configuração do plugin JWT
