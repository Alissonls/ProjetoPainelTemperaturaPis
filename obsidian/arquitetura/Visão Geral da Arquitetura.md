---
tags: [arquitetura, sistema, overview]
tipo: arquitetura
relacionado: ["[[Fluxo de Dados]]", "[[Tecnologias Utilizadas]]", "[[Banco de Dados]]"]
criado: 2026-04-17
---

# 🏗️ Visão Geral da Arquitetura

O PoolControl usa uma arquitetura **Cliente-Servidor** operando em **rede local (LAN)**, sem dependência de internet.

## Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────┐
│                    REDE LOCAL (LAN)                       │
│                                                          │
│  ┌─────────────┐      REST API       ┌───────────────┐  │
│  │  Técnico    │ ──────────────────▶ │               │  │
│  │ (Dashboard) │                     │   Servidor    │  │
│  └─────────────┘                     │   Fastify     │  │
│                                      │  :3001        │  │
│  ┌─────────────┐    WebSocket (WS)   │               │  │
│  │  Painel TV  │ ◀────────────────── │               │  │
│  │  (Panel)    │                     │               │  │
│  └─────────────┘                     │               │  │
│                                      │               │  │
│  ┌─────────────┐    WebSocket (WS)   │               │  │
│  │  Painel TV  │ ◀────────────────── │               │  │
│  │  (Panel 2)  │                     └───────┬───────┘  │
│  └─────────────┘                             │           │
│                                        Prisma ORM        │
│                                              │           │
│                                      ┌───────▼───────┐  │
│                                      │  SQLite DB    │  │
│                                      │  (dev.db)     │  │
│                                      └───────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Princípios de Design

- **Sem internet**: Funciona 100% offline em LAN
- **Leveza**: SQLite (sem servidor de banco), Fastify (ultra-rápido), Vite (build instantâneo)
- **Tempo real**: WebSocket elimina o polling — sem refresh manual
- **Segurança**: JWT expira em 8h, senhas com bcrypt (hash), metadados gravados no servidor
- **Rastreabilidade**: Técnico, data e hora são gravados pelo servidor (não pelo cliente)

## Fluxo Principal

1. Técnico faz `POST /auth/login` → recebe JWT
2. Técnico envia `POST /temperature` com o token
3. Servidor valida JWT, grava no SQLite, faz **broadcast** via WebSocket
4. Todos os painéis recebem o evento `NEW_TEMPERATURE` e atualizam instantaneamente

## Notas Relacionadas

- [[Fluxo de Dados]] — detalhes passo a passo
- [[Servidor Fastify]] — implementação do backend
- [[WebSocket em Tempo Real]] — estratégia de atualização
- [[Banco de Dados]] — estrutura das tabelas
