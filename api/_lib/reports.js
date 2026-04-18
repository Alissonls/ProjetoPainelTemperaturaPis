import prisma from "../../_lib/prisma.js";
import { setCors, handlePreflight, verifyAuth, requireAdmin } from "../../_lib/helpers.js";
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

export default weeklyHandler;
