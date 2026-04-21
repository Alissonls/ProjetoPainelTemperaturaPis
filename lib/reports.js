import prisma from "./prisma.js";
import { setCors, handlePreflight, verifyAuth, requireAdmin } from "./helpers.js";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

async function getRecords(period) {
  const now = new Date();
  const gte = period === "monthly" ? startOfMonth(now) : startOfWeek(now, { weekStartsOn: 1 });
  const lte = period === "monthly" ? endOfMonth(now) : endOfWeek(now, { weekStartsOn: 1 });
  return prisma.poolRecord.findMany({
    where: { createdAt: { gte, lte } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// GET /api/reports/weekly — somente admin
export async function weeklyHandler(req, res) {
  setCors(res);
  if (handlePreflight(req, res)) return;
  try {
    const user = verifyAuth(req);
    requireAdmin(user);
    const records = await getRecords("weekly");
    return res.status(200).json(records);
  } catch (err) {
    const status = err.message.includes("admin") ? 403 : err.message.includes("autorizado") ? 401 : 500;
    return res.status(status).json({ message: err.message });
  }
}

// GET /api/reports/monthly — somente admin
export async function monthlyHandler(req, res) {
  setCors(res);
  if (handlePreflight(req, res)) return;
  try {
    const user = verifyAuth(req);
    requireAdmin(user);
    const records = await getRecords("monthly");
    return res.status(200).json(records);
  } catch (err) {
    const status = err.message.includes("admin") ? 403 : err.message.includes("autorizado") ? 401 : 500;
    return res.status(status).json({ message: err.message });
  }
}

// GET /api/reports/date — somente admin
export async function dateHandler(req, res) {
  setCors(res);
  if (handlePreflight(req, res)) return;
  try {
    const user = verifyAuth(req);
    requireAdmin(user);
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Data é obrigatória" });

    const start = new Date(date + "T00:00:00");
    const end = new Date(date + "T23:59:59");

    const records = await prisma.poolRecord.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(records);
  } catch (err) {
    const status = err.message.includes("admin") ? 403 : err.message.includes("autorizado") ? 401 : 500;
    return res.status(status).json({ message: err.message });
  }
}

export default weeklyHandler;
