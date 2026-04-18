// Script de seed para produção (PostgreSQL/Neon)
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const { PrismaClient } = pkg;

// Configuração obrigatória para Prisma 7 + PostgreSQL
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: { role: "admin" },
    create: {
      username: "admin",
      name: "Administrador",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    },
  });

  const op = await prisma.user.upsert({
    where: { username: "operador1" },
    update: {},
    create: {
      username: "operador1",
      name: "João Silva",
      password: await bcrypt.hash("op123", 10),
      role: "operator",
    },
  });

  console.log("✅ Usuários criados no banco de produção:");
  console.log("   admin / admin123     → ADMIN");
  console.log("   operador1 / op123    → OPERADOR");
}

main()
  .catch((e) => { console.error("❌", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
