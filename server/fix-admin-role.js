import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const updated = await prisma.user.updateMany({
  where: { username: "admin" },
  data: { role: "admin" },
});
console.log(`✅ ${updated.count} usuário(s) atualizados para role=admin`);

const users = await prisma.user.findMany({ select: { username: true, name: true, role: true } });
console.log("Usuários no banco:");
users.forEach(u => console.log(`  ${u.username} (${u.name}) → ${u.role}`));

await prisma.$disconnect();
