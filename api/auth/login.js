import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { setCors, handlePreflight } from "../lib/helpers.js";

export default async function handler(req, res) {
  setCors(res);
  if (handlePreflight(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Usuário ou senha inválidos" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, username: user.username, role: user.role },
      process.env.JWT_SECRET || "poolcontrol-secret-2024",
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ message: "Erro interno" });
  }
}
