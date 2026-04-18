---
tags: [backend, api, rotas, endpoints]
tipo: backend
relacionado: ["[[Servidor Fastify]]", "[[Autenticação JWT]]", "[[Banco de Dados]]"]
criado: 2026-04-17
---

# 🛣️ Rotas da API

Base URL: `http://localhost:3001`

## Rotas Públicas (sem token)

### `POST /auth/login`
Autentica o técnico e retorna um JWT.

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Resposta 200:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "Administrador",
    "username": "admin"
  }
}
```

**Erros:**
- `400` — username ou password ausentes
- `401` — usuário não encontrado ou senha incorreta

---

### `GET /temperature/latest`
Retorna o registro mais recente. Usado pelos painéis ao carregar.

**Resposta 200:**
```json
{
  "id": "uuid",
  "value": 28.5,
  "createdAt": "2026-04-17T02:55:00.000Z",
  "userId": "uuid",
  "user": { "name": "Administrador" }
}
```

Retorna `null` se não houver registros.

---

## Rotas Protegidas (exige `Authorization: Bearer <token>`)

### `POST /temperature`
Registra uma nova temperatura.

**Body:**
```json
{ "value": 28.5 }
```

**Resposta 200:** Record completo + user.name

**Efeito colateral:** dispara broadcast via [[WebSocket em Tempo Real]] para todos os painéis conectados.

---

### `GET /reports/weekly`
Retorna todos os registros da semana atual (segunda a domingo).

**Resposta 200:** Array de TemperatureRecord com user.name

---

### `GET /reports/monthly`
Retorna todos os registros do mês atual.

**Resposta 200:** Array de TemperatureRecord com user.name

---

## WebSocket

### `GET /ws` (upgrade)
Conexão persistente para painéis receberem atualizações em tempo real.

**Evento recebido pelo cliente:**
```json
{
  "type": "NEW_TEMPERATURE",
  "data": {
    "id": "uuid",
    "value": 28.5,
    "createdAt": "...",
    "user": { "name": "Administrador" }
  }
}
```

## Tabela Resumo

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth/login` | ❌ | Login do técnico |
| GET | `/temperature/latest` | ❌ | Última temperatura |
| POST | `/temperature` | ✅ JWT | Registrar temperatura |
| GET | `/reports/weekly` | ✅ JWT | Relatório semanal |
| GET | `/reports/monthly` | ✅ JWT | Relatório mensal |
| WS | `/ws` | ❌ | Canal tempo real |
