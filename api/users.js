import prisma from "../lib/prisma.js";
import { setCors, handlePreflight, verifyAuth, requireAdmin } from "../lib/helpers.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

export default async function handler(req, res) {
  setCors(res);
  if (handlePreflight(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const authUser = verifyAuth(req);
    requireAdmin(authUser);
  } catch (err) {
    const status = err.message.includes("admin") ? 403 : 401;
    return res.status(status).json({ message: err.message });
  }

  const { name, username, password, role = "operator" } = req.body ?? {};

  if (!name || !username || !password) {
    return res.status(400).json({ message: "Nome, usuário e senha são obrigatórios" });
  }

  try {
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) return res.status(400).json({ message: "Usuário já existe" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, username, password: hashedPassword, role },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error("[users/create]", err);
    return res.status(500).json({ message: "Erro interno: " + err.message });
  }
}
