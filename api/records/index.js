import prisma from "../_lib/prisma.js";
import { setCors, handlePreflight, verifyAuth } from "../_lib/helpers.js";
import { broadcastRecord } from "../_lib/pusher.js";

// POST /api/records — protegido (requer JWT)
export default async function handler(req, res) {
  setCors(res);
  if (handlePreflight(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  let authUser;
  try {
    authUser = verifyAuth(req);
  } catch {
    return res.status(401).json({ message: "Não autorizado" });
  }

  const { temperature, ph } = req.body ?? {};
  if (temperature === undefined || temperature === null || temperature === "") {
    return res.status(400).json({ message: "Temperatura é obrigatória" });
  }

  try {
    const record = await prisma.poolRecord.create({
      data: {
        temperature: parseFloat(temperature),
        ph: ph !== undefined && ph !== "" ? parseFloat(ph) : null,
        userId: authUser.id,
      },
      include: { user: { select: { name: true } } },
    });

    // Notifica todos os painéis via Pusher
    await broadcastRecord(record);

    return res.status(200).json(record);
  } catch (err) {
    console.error("[records/create]", err);
    return res.status(500).json({ message: "Erro interno" });
  }
}
