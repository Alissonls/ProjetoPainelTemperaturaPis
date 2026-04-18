---
tags: [projeto, mapa, poolcontrol]
tipo: MOC
criado: 2026-04-17
status: ativo
---

# 🗺️ PoolControl — Mapa do Projeto

> Sistema de monitoramento e exibição de temperatura de piscina em rede local.

## 🔗 Notas Principais

### 🏗️ Arquitetura
- [[Visão Geral da Arquitetura]]
- [[Fluxo de Dados]]
- [[Banco de Dados]]
- [[Autenticação JWT]]
- [[WebSocket em Tempo Real]]

### 🖥️ Backend (Servidor)
- [[Servidor Fastify]]
- [[Rotas da API]]
- [[Prisma 7 e SQLite]]
- [[Seed - Usuário Inicial]]

### 🎨 Frontend (Cliente)
- [[Página de Login]]
- [[Dashboard do Técnico]]
- [[Painel de Exibição Pública]]
- [[Página de Relatórios]]
- [[API Client (Axios)]]

### 🛠️ DevOps & Config
- [[Tecnologias Utilizadas]]
- [[Como Rodar o Projeto]]
- [[Estrutura de Pastas]]
- [[Git e GitHub]]
- [[Variáveis de Ambiente]]

---

## 📊 Status dos Módulos

| Módulo | Status | Observações |
|--------|--------|-------------|
| Backend API | ✅ Funcionando | Fastify + Prisma 7 |
| Autenticação | ✅ Funcionando | JWT 8h |
| WebSocket | ✅ Funcionando | Atualização em tempo real |
| Login Page | ✅ Funcionando | Dark glassmorphism |
| Dashboard | ✅ Funcionando | Registro de temperatura |
| Painel Público | ✅ Funcionando | Exibição em TV/monitor |
| Relatórios | ✅ Funcionando | Semanal e Mensal |
| GitHub | ✅ Publicado | Branch `main` |

---

## 🚀 Acesso Rápido

| Tela | URL | Quem usa |
|------|-----|----------|
| Login | `http://localhost:5173/login` | Técnicos |
| Dashboard | `http://localhost:5173/` | Técnicos |
| Painel Público | `http://localhost:5173/panel` | TVs/Monitores |
| Relatórios | `http://localhost:5173/reports` | Técnicos |
| API Backend | `http://localhost:3001` | Sistema |
