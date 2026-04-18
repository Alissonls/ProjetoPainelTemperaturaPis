---
tags: [devops, setup, rodar, comandos]
tipo: operacional
relacionado: ["[[Servidor Fastify]]", "[[Tecnologias Utilizadas]]", "[[Estrutura de Pastas]]", "[[Seed - Usuário Inicial]]"]
criado: 2026-04-17
---

# 🚀 Como Rodar o Projeto

## Pré-requisitos

- **Node.js** v18+ (testado com v24)
- **npm** v9+
- Git

## 1. Clonar o Repositório

```bash
git clone https://github.com/Alissonls/ProjetoPainelTemperaturaPis.git
cd ProjetoPainelTemperaturaPis
```

## 2. Instalar Dependências do Servidor

```bash
cd server
npm install
```

## 3. Gerar o Banco de Dados

```bash
# Ainda na pasta server/
npx prisma db push       # cria o arquivo dev.db com as tabelas

node seed.js             # cria o usuário admin inicial
```

Saída esperada:
```
✅ Usuário criado: admin
   Login: admin | Senha: admin123
```

## 4. Iniciar o Servidor

```bash
node index.js
```

Saída esperada:
```
✅ PoolControl Server → http://localhost:3001
```

> **Mantenha este terminal aberto.**

## 5. Instalar Dependências do Cliente

```bash
# Nova aba do terminal
cd ../client
npm install
```

## 6. Iniciar o Cliente

```bash
npm run dev
```

Saída esperada:
```
  VITE vX.X  ready in Xms

  ➜  Local:   http://localhost:5173/
```

## 7. Acessar o Sistema

| Tela | URL |
|------|-----|
| Login / Dashboard | http://localhost:5173/ |
| Painel Público (TVs) | http://localhost:5173/panel |

**Credenciais iniciais:**
- Usuário: `admin`
- Senha: `admin123`

---

## Acesso em Rede Local (Outros Dispositivos)

1. Descubra o IP da máquina servidora:
   ```powershell
   ipconfig  # procure por IPv4, ex: 192.168.1.10
   ```

2. Inicie o Vite expondo a rede:
   ```bash
   npm run dev -- --host
   ```

3. Acesse dos outros dispositivos:
   ```
   http://192.168.1.10:5173/panel
   ```

4. **Importante:** No arquivo `client/src/pages/Panel.tsx`, substitua `localhost` pelo IP:
   ```javascript
   const socket = new WebSocket("ws://192.168.1.10:3001/ws");
   ```
   ```typescript
   // api.ts
   baseURL: "http://192.168.1.10:3001"
   ```

---

## Parar os Serviços

```bash
# No terminal do servidor e do cliente
Ctrl + C
```

## Notas Relacionadas

- [[Tecnologias Utilizadas]] — stack completa
- [[Estrutura de Pastas]] — organização do código
- [[Seed - Usuário Inicial]] — gerenciar usuários
- [[Git e GitHub]] — repositório
