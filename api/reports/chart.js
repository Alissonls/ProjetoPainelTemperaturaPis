import prisma from "../lib/prisma.js";
import { setCors, handlePreflight, verifyAuth, requireAdmin } from "../lib/helpers.js";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

export default async function handler(req, res) {
  setCors(res);
  if (handlePreflight(req, res)) return;

  let authUser;
  try {
    authUser = verifyAuth(req);
    requireAdmin(authUser);
  } catch (err) {
    const status = err.message.includes("admin") ? 403 : 401;
    return res.status(status).json({ message: err.message });
  }

  const { period = "weekly" } = req.query;
  const now = new Date();
  const gte = period === "monthly" ? startOfMonth(now) : startOfWeek(now, { weekStartsOn: 1 });
  const lte = period === "monthly" ? endOfMonth(now) : endOfWeek(now, { weekStartsOn: 1 });

  try {
    const records = await prisma.poolRecord.findMany({
      where: { createdAt: { gte, lte } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });

    const byDay = {};
    for (const r of records) {
      const day = format(new Date(r.createdAt), "dd/MM");
      if (!byDay[day]) byDay[day] = { temps: [], phs: [] };
      byDay[day].temps.push(r.temperature);
      if (r.ph !== null) byDay[day].phs.push(r.ph);
    }

    const timeline = Object.entries(byDay).map(([dia, val]) => ({
      dia,
      tempMedia: parseFloat((val.temps.reduce((a, b) => a + b, 0) / val.temps.length).toFixed(1)),
      tempMax: Math.max(...val.temps),
      tempMin: Math.min(...val.temps),
      phMedio: val.phs.length
        ? parseFloat((val.phs.reduce((a, b) => a + b, 0) / val.phs.length).toFixed(2))
        : null,
      totalRegistros: val.temps.length,
    }));

    const techCount = {};
    for (const r of records) techCount[r.user.name] = (techCount[r.user.name] || 0) + 1;
    const byTechnician = Object.entries(techCount).map(([name, count]) => ({ name, count }));

    const tempRanges = { "< 25°C": 0, "25–28°C": 0, "28–30°C": 0, "> 30°C": 0 };
    for (const r of records) {
      if (r.temperature < 25) tempRanges["< 25°C"]++;
      else if (r.temperature < 28) tempRanges["25–28°C"]++;
      else if (r.temperature <= 30) tempRanges["28–30°C"]++;
      else tempRanges["> 30°C"]++;
    }
    const tempDistribution = Object.entries(tempRanges).map(([range, count]) => ({ range, count }));

    const phRanges = { "Ácido (< 7.0)": 0, "Ideal (7.0–7.6)": 0, "Alcalino (> 7.6)": 0, "Sem registro": 0 };
    for (const r of records) {
      if (r.ph === null) phRanges["Sem registro"]++;
      else if (r.ph < 7.0) phRanges["Ácido (< 7.0)"]++;
      else if (r.ph <= 7.6) phRanges["Ideal (7.0–7.6)"]++;
      else phRanges["Alcalino (> 7.6)"]++;
    }
    const phDistribution = Object.entries(phRanges).map(([range, count]) => ({ range, count }));

    return res.status(200).json({
      timeline, byTechnician, tempDistribution, phDistribution, total: records.length,
    });
  } catch (err) {
    console.error("[reports/chart]", err);
    return res.status(500).json({ message: "Erro interno" });
  }
}
