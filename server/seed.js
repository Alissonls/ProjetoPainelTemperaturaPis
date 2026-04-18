import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Administrador",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    },
  });

  // Operador de exemplo
  await prisma.user.upsert({
    where: { username: "operador1" },
    update: {},
    create: {
      username: "operador1",
      name: "João Silva",
      password: await bcrypt.hash("op123", 10),
      role: "operator",
    },
  });

  console.log("✅ Usuários criados:");
  console.log("   admin / admin123     → perfil ADMIN");
  console.log("   operador1 / op123    → perfil OPERADOR");
}

main()
  .catch((e) => { console.error("❌", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
