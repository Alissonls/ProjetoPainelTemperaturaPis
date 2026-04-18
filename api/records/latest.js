import prisma from "../_lib/prisma.js";
import { setCors, handlePreflight } from "../_lib/helpers.js";

// GET /api/records/latest — pública (painéis não precisam de token)
export default async function handler(req, res) {
  setCors(res);
  if (handlePreflight(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const record = await prisma.poolRecord.findFirst({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });
    return res.status(200).json(record);
  } catch (err) {
    console.error("[records/latest]", err);
    return res.status(500).json({ message: "Erro interno" });
  }
}
