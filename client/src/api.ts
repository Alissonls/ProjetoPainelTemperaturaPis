import axios from "axios";

// Em desenvolvimento: proxy Vite aponta para localhost:3001
// Em produção (Vercel): URL relativa /api
const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
