import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import websocket from "@fastify/websocket";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");

// ─── Prisma 7 Driver Adapter (obrigatório) ─────────────
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// ─── Fastify Setup ──────────────────────────────────────
const fastify = Fastify({ logger: false });

await fastify.register(cors, { origin: "*" });
await fastify.register(jwt, { secret: "poolcontrol-secret-2024" });
await fastify.register(websocket);

// ─── WebSocket: Painéis conectados ─────────────────────
const clients = new Set();

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

const broadcast = (data) => {
  const msg = JSON.stringify({ type: "NEW_TEMPERATURE", data });
  for (const s of clients) {
    if (s.readyState === 1) s.send(msg);
  }
};

// ─── Rota pública de login ──────────────────────────────
fastify.post("/auth/login", async (request, reply) => {
  const { username, password } = request.body ?? {};
  if (!username || !password) {
    return reply.status(400).send({ message: "Usuário e senha são obrigatórios" });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return reply.status(401).send({ message: "Usuário não encontrado" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return reply.status(401).send({ message: "Senha incorreta" });
  }

  const token = fastify.jwt.sign(
    { id: user.id, name: user.name, username: user.username },
    { expiresIn: "8h" }
  );
  return { token, user: { id: user.id, name: user.name, username: user.username } };
});

// ─── Rota pública: última temperatura (painéis) ─────────
fastify.get("/temperature/latest", async () => {
  return prisma.temperatureRecord.findFirst({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });
});

// ─── Middleware JWT (rotas protegidas) ──────────────────
const PUBLIC_ROUTES = ["/auth/login", "/temperature/latest", "/ws"];

fastify.addHook("preHandler", async (request, reply) => {
  const isPublic = PUBLIC_ROUTES.some((r) => request.url.startsWith(r));
  if (isPublic || request.method === "OPTIONS") return;
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ message: "Não autorizado" });
  }
});

// ─── Registrar temperatura (protegido) ─────────────────
fastify.post("/temperature", async (request, reply) => {
  const { value } = request.body ?? {};
  if (value === undefined || value === null || value === "") {
    return reply.status(400).send({ message: "Valor de temperatura é obrigatório" });
  }

  const record = await prisma.temperatureRecord.create({
    data: { value: parseFloat(value), userId: request.user.id },
    include: { user: { select: { name: true } } },
  });

  broadcast(record);
  return record;
});

// ─── Relatórios ─────────────────────────────────────────
fastify.get("/reports/weekly", async () => {
  const now = new Date();
  return prisma.temperatureRecord.findMany({
    where: {
      createdAt: {
        gte: startOfWeek(now, { weekStartsOn: 1 }),
        lte: endOfWeek(now, { weekStartsOn: 1 }),
      },
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
});

fastify.get("/reports/monthly", async () => {
  const now = new Date();
  return prisma.temperatureRecord.findMany({
    where: {
      createdAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
});

// ─── Start ──────────────────────────────────────────────
await fastify.listen({ port: 3001, host: "0.0.0.0" });
console.log("✅ PoolControl Server → http://localhost:3001");
