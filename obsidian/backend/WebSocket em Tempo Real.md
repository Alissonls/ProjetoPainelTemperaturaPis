---
tags: [backend, websocket, tempo-real, broadcast]
tipo: backend
relacionado: ["[[Servidor Fastify]]", "[[Painel de Exibição Pública]]", "[[Fluxo de Dados]]"]
criado: 2026-04-17
---

# 📡 WebSocket em Tempo Real

## Estratégia: Pub/Sub com broadcast

O sistema usa o padrão **Publisher/Subscriber** para atualizar todos os painéis simultaneamente quando uma nova temperatura é registrada.

## Por Que WebSocket ao Invés de Polling?

| Polling (intervalo de X segundos) | WebSocket (este sistema) |
|-----------------------------------|--------------------------|
| Faz requisição mesmo sem mudança | Só recebe quando há mudança |
| Atraso médio = metade do intervalo | Atraso < 50ms |
| Alto consumo de rede/CPU | Conexão dormindo |
| Ineficiente | Eficiente |

## Implementação no Servidor

```javascript
// Set de clientes conectados
const clients = new Set();

// Rota do WebSocket
fastify.register(async (instance) => {
  instance.get("/ws", { websocket: true }, (socket) => {
    clients.add(socket);
    console.log(`📺 Painel conectado. Total: ${clients.size}`);
    
    socket.on("close", () => {
      clients.delete(socket);
      console.log(`📺 Painel desconectado. Total: ${clients.size}`);
    });
  });
});

// Função de broadcast (chamada após cada INSERT)
const broadcast = (data) => {
  const msg = JSON.stringify({ type: "NEW_TEMPERATURE", data });
  for (const s of clients) {
    if (s.readyState === 1) s.send(msg); // 1 = OPEN
  }
};
```

## Implementação no Painel (cliente)

```javascript
// Panel.tsx
useEffect(() => {
  // Busca temperatura inicial ao carregar
  api.get("/temperature/latest").then(res => setData(res.data));

  // Conecta ao WebSocket
  const socket = new WebSocket("ws://localhost:3001/ws");
  
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "NEW_TEMPERATURE") {
      setData(msg.data); // Framer Motion anima a troca
    }
  };

  return () => socket.close(); // Cleanup ao desmontar
}, []);
```

## Ciclo de Vida da Conexão

```
Painel abre     → socket conecta → adicionado ao Set (clients)
Técnico salva   → broadcast()   → todos os sockets recebem
Painel fecha    → socket fecha  → removido do Set (clients)
```

## Suporte a Múltiplas Telas

O `Set<WebSocket>` suporta **ilimitadas telas conectadas simultaneamente**. Basta abrir `http://IP:5173/panel` em qualquer monitor da rede.

> [!tip] Rede Local
> Para usar em monitores diferentes, substitua `localhost` pelo IP da máquina servidora, ex: `ws://192.168.1.10:3001/ws`
> 
> Configure isso em `client/src/pages/Panel.tsx`.

## Notas Relacionadas

- [[Painel de Exibição Pública]] — implementação do cliente
- [[Servidor Fastify]] — configuração do @fastify/websocket
- [[Fluxo de Dados]] — sequência completa
