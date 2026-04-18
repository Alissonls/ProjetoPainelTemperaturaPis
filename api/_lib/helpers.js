import jwt from "jsonwebtoken";

// Aplica headers CORS em todas as respostas
export function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

// Verifica se é preflight e finaliza
export function handlePreflight(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}

// Verifica JWT e retorna payload; lança erro se inválido
export function verifyAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    throw new Error("Não autorizado");
  }
  const token = auth.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET || "poolcontrol-secret-2024");
}

// Verifica se o usuário autenticado é admin
export function requireAdmin(user) {
  if (user?.role !== "admin") {
    throw new Error("Acesso negado — perfil admin necessário");
  }
}
