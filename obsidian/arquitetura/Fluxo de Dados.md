---
tags: [arquitetura, fluxo, dados]
tipo: fluxo
relacionado: ["[[Visão Geral da Arquitetura]]", "[[WebSocket em Tempo Real]]", "[[Autenticação JWT]]"]
criado: 2026-04-17
---

# 🔄 Fluxo de Dados

## 1. Fluxo de Login

```
Técnico              Frontend              Backend (Fastify)        SQLite
   │                    │                        │                    │
   │── digita login ──▶ │                        │                    │
   │                    │── POST /auth/login ───▶│                    │
   │                    │                        │── SELECT user ───▶ │
   │                    │                        │◀── user row ─────  │
   │                    │                        │── bcrypt.compare() │
   │                    │◀── { token, user } ────│                    │
   │◀── navega para / ──│                        │                    │
   │   (token salvo     │                        │                    │
   │    localStorage)   │                        │                    │
```

## 2. Fluxo de Registro de Temperatura

```
Técnico              Frontend              Backend                 SQLite        Painéis (WS)
   │                    │                    │                       │               │
   │── digita 28.5 ───▶ │                    │                       │               │
   │── clica Salvar ──▶ │                    │                       │               │
   │                    │── POST /temperature│                       │               │
   │                    │   Authorization:   │                       │               │
   │                    │   Bearer <JWT> ──▶ │                       │               │
   │                    │                    │── jwtVerify() ─────▶  │               │
   │                    │                    │── INSERT record ────  │               │
   │                    │                    │◀── record +user ─── ──│               │
   │                    │◀── record JSON ────│                       │               │
   │                    │                    │── ws.send() ─────────────────────────▶│
   │                    │                    │   (broadcast para                     │
   │                    │                    │    todos os painéis)                  │
   │                    │                    │                       │               │
   │                    │                    │                       │  atualiza ◀───│
   │                    │                    │                       │  temperatura  │
```

## 3. Fluxo WebSocket (Painel)

```
Painel (browser)                     Servidor (Fastify WS)
      │                                        │
      │── GET /ws (Upgrade: websocket) ───────▶│
      │◀── 101 Switching Protocols ────────────│
      │                                        │ ← socket adicionado ao Set
      │           (conexão persistente)        │
      │                                        │
      │◀── { type: 'NEW_TEMPERATURE', data } ──│ ← evento do técnico
      │                                        │
      │  atualiza UI com animação               │
      │  (Framer Motion)                       │
```

## 4. Fluxo de Relatórios

```
Técnico → GET /reports/weekly  → filtra por startOfWeek..endOfWeek
Técnico → GET /reports/monthly → filtra por startOfMonth..endOfMonth
```

Ambos retornam array de `TemperatureRecord` com `user.name` incluído via Prisma `include`.
