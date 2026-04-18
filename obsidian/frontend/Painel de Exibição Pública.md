---
tags: [frontend, painel, websocket, tv, exibição]
tipo: frontend
relacionado: ["[[WebSocket em Tempo Real]]", "[[Dashboard do Técnico]]", "[[Fluxo de Dados]]"]
criado: 2026-04-17
---

# 📺 Painel de Exibição Pública

## Localização

```
client/src/pages/Panel.tsx
```

## URL de Acesso

```
http://localhost:5173/panel
http://IP_DO_SERVIDOR:5173/panel   ← para TVs/monitores na rede
```

> [!important] Esta é a tela que exibe a temperatura
> O Painel é projetado para rodar em **modo quiosque em TVs ou monitores grandes**. Não requer login. Qualquer dispositivo na rede pode acessar.

## Funcionalidades

- ⏰ Relógio em tempo real (atualiza a cada 1 segundo)
- 📅 Data por extenso em pt-BR (ex: "quinta-feira, 16 de abril")
- 🌡️ Temperatura em **números gigantes** (visível à distância)
- 📡 Atualização automática via **WebSocket** (sem refresh)
- 👤 Mostra o nome do técnico responsável pelo último registro
- 🕐 Horário da última atualização
- ✨ Animação suave com **Framer Motion** ao trocar o valor

## Design

- Fundo preto com glow azul centralizado
- Fonte ultra-bold para máxima visibilidade
- Temperatura ocupa ~70% da altura da tela
- `°C` em azul contrastante
- Rodapé com `POOLCONTROL SYSTEM`

## Código Chave

```tsx
// Conecta ao WebSocket e atualiza ao receber NEW_TEMPERATURE
useEffect(() => {
  api.get("/temperature/latest").then(res => setData(res.data));
  
  const socket = new WebSocket("ws://localhost:3001/ws");
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "NEW_TEMPERATURE") {
      setData(msg.data); // anima com Framer Motion
    }
  };
  return () => socket.close();
}, []);

// Display com AnimatePresence para animar a troca
<AnimatePresence mode="wait">
  <motion.div
    key={data?.id || "empty"}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 1.1, opacity: 0 }}
    transition={{ type: "spring", damping: 15 }}
  >
    {data ? data.value.toFixed(1) : "00.0"}
  </motion.div>
</AnimatePresence>
```

## Notas Relacionadas

- [[WebSocket em Tempo Real]] — como o broadcast funciona
- [[Dashboard do Técnico]] — onde as temperaturas são registradas
- [[Rotas da API]] — rota `/ws` e `/temperature/latest`
