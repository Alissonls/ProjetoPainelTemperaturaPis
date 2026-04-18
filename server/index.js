import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import websocket from "@fastify/websocket";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subDays } from "date-fns";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const fastify = Fastify({ logger: false });

await fastify.register(cors, { origin: "*" });
await fastify.register(jwt, { secret: "poolcontrol-secret-2024" });
await fastify.register(websocket);

// ─── WebSocket ─────────────────────────────────────────
const clients = new Set();

fastify.register(async (instance) => {
  instance.get("/ws", { websocket: true }, (socket) => {
    clients.add(socket);
    socket.on("close", () => clients.delete(socket));
  });
});

const broadcast = (data) => {
  const msg = JSON.stringify({ type: "NEW_RECORD", data });
  for (const s of clients) {
    if (s.readyState === 1) s.send(msg);
  }
};

// ─── LOGIN ─────────────────────────────────────────────
fastify.post("/auth/login", async (request, reply) => {
  const { username, password } = request.body ?? {};
  if (!username || !password)
    return reply.status(400).send({ message: "Usuário e senha são obrigatórios" });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return reply.status(401).send({ message: "Usuário ou senha inválidos" });

  const token = fastify.jwt.sign(
    { id: user.id, name: user.name, username: user.username, role: user.role },
    { expiresIn: "8h" }
  );
  return { token, user: { id: user.id, name: user.name, username: user.username, role: user.role } };
});

// ─── ÚLTIMA LEITURA (pública) ──────────────────────────
fastify.get("/records/latest", async () => {
  return prisma.poolRecord.findFirst({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });
});

// ─── AUTH HOOK ─────────────────────────────────────────
const PUBLIC_ROUTES = ["/auth/login", "/records/latest", "/ws"];

fastify.addHook("preHandler", async (request, reply) => {
  if (PUBLIC_ROUTES.some((r) => request.url.startsWith(r)) || request.method === "OPTIONS") return;
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ message: "Não autorizado" });
  }
});

// ─── HELPER: verifica se é admin ───────────────────────
const requireAdmin = (request, reply) => {
  if (request.user?.role !== "admin") {
    reply.status(403).send({ message: "Acesso negado — perfil admin necessário" });
    return false;
  }
  return true;
};

// ─── REGISTRAR (operador e admin) ──────────────────────
fastify.post("/records", async (request, reply) => {
  const { temperature, ph } = request.body ?? {};
  if (temperature === undefined || temperature === null || temperature === "")
    return reply.status(400).send({ message: "Temperatura é obrigatória" });

  const record = await prisma.poolRecord.create({
    data: {
      temperature: parseFloat(temperature),
      ph: ph !== undefined && ph !== "" ? parseFloat(ph) : null,
      userId: request.user.id,
    },
    include: { user: { select: { name: true } } },
  });

  broadcast(record);
  return record;
});

// ─── RELATÓRIOS (somente admin) ────────────────────────
fastify.get("/reports/weekly", async (request, reply) => {
  if (!requireAdmin(request, reply)) return;
  const now = new Date();
  return prisma.poolRecord.findMany({
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

fastify.get("/reports/monthly", async (request, reply) => {
  if (!requireAdmin(request, reply)) return;
  const now = new Date();
  return prisma.poolRecord.findMany({
    where: {
      createdAt: {
        gte: startOfMonth(now),
        lte: endOfMonth(now),
      },
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
});

// ─── DADOS DOS GRÁFICOS (somente admin) ────────────────
fastify.get("/reports/chart", async (request, reply) => {
  if (!requireAdmin(request, reply)) return;

  const { period = "weekly" } = request.query;
  const now = new Date();
  const gte = period === "monthly" ? startOfMonth(now) : startOfWeek(now, { weekStartsOn: 1 });
  const lte = period === "monthly" ? endOfMonth(now) : endOfWeek(now, { weekStartsOn: 1 });

  const records = await prisma.poolRecord.findMany({
    where: { createdAt: { gte, lte } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Agrupamento por dia para gráfico de linha
  const byDay = {};
  for (const r of records) {
    const day = format(new Date(r.createdAt), "dd/MM");
    if (!byDay[day]) byDay[day] = { temps: [], phs: [], technicians: {} };
    byDay[day].temps.push(r.temperature);
    if (r.ph !== null) byDay[day].phs.push(r.ph);
    byDay[day].technicians[r.user.name] = (byDay[day].technicians[r.user.name] || 0) + 1;
  }

  const timeline = Object.entries(byDay).map(([dia, val]) => ({
    dia,
    tempMedia: parseFloat((val.temps.reduce((a, b) => a + b, 0) / val.temps.length).toFixed(1)),
    tempMax: Math.max(...val.temps),
    tempMin: Math.min(...val.temps),
    phMedio: val.phs.length ? parseFloat((val.phs.reduce((a, b) => a + b, 0) / val.phs.length).toFixed(2)) : null,
    totalRegistros: val.temps.length,
  }));

  // Distribuição por técnico (para gráfico de pizza)
  const techniciansCount = {};
  for (const r of records) {
    techniciansCount[r.user.name] = (techniciansCount[r.user.name] || 0) + 1;
  }
  const byTechnician = Object.entries(techniciansCount).map(([name, count]) => ({ name, count }));

  // Distribuição de faixas de temperatura
  const tempRanges = { "< 25°C": 0, "25–28°C": 0, "28–30°C": 0, "> 30°C": 0 };
  for (const r of records) {
    if (r.temperature < 25) tempRanges["< 25°C"]++;
    else if (r.temperature < 28) tempRanges["25–28°C"]++;
    else if (r.temperature <= 30) tempRanges["28–30°C"]++;
    else tempRanges["> 30°C"]++;
  }
  const tempDistribution = Object.entries(tempRanges).map(([range, count]) => ({ range, count }));

  // Distribuição de faixas de pH
  const phRanges = { "Ácido (< 7.0)": 0, "Ideal (7.0–7.6)": 0, "Alcalino (> 7.6)": 0, "Sem registro": 0 };
  for (const r of records) {
    if (r.ph === null) phRanges["Sem registro"]++;
    else if (r.ph < 7.0) phRanges["Ácido (< 7.0)"]++;
    else if (r.ph <= 7.6) phRanges["Ideal (7.0–7.6)"]++;
    else phRanges["Alcalino (> 7.6)"]++;
  }
  const phDistribution = Object.entries(phRanges).map(([range, count]) => ({ range, count }));

  return { timeline, byTechnician, tempDistribution, phDistribution, total: records.length };
});

// ─── START ──────────────────────────────────────────────
await fastify.listen({ port: 3001, host: "0.0.0.0" });
console.log("✅ PoolControl Server → http://localhost:3001");
