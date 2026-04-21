import { useState, useEffect } from "react";
import api from "../api";
import { LogOut, Thermometer, BarChart2, Send, User, Droplets, CheckCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [temperature, setTemperature] = useState("");
  const [ph, setPh] = useState("");
  const [cloro, setCloro] = useState("");
  const [latest, setLatest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin" || (!user.role && user.username === "admin");
  const navigate = useNavigate();

  const fetchLatest = async () => {
    try {
      const { data } = await api.get("/records/latest");
      setLatest(data);
    } catch (err) {}
  };

  useEffect(() => { fetchLatest(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temperature) return;
    setLoading(true);
    try {
      await api.post("/records", {
        temperature,
        ph: ph || undefined,
        cloro: cloro || undefined,
      });
      setTemperature("");
      setPh("");
      setCloro("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchLatest();
    } catch (err) {
      alert("Erro ao registrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Thermometer className="text-blue-500 w-6 h-6" />
          <span className="font-bold text-xl tracking-tight text-white">PoolControl</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            isAdmin
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
          }`}>
            {isAdmin ? "ADMIN" : "OPERADOR"}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
            <User className="w-4 h-4" />
            <span>{user.name}</span>
          </div>
          {isAdmin && (
            <Link to="/reports" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">
              <BarChart2 className="w-4 h-4" />
              Relatórios
            </Link>
          )}
          <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Banner */}
        <section className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-1">Bem-vindo</p>
            <h2 className="text-3xl font-bold text-white">{user.name}</h2>
            <p className="text-blue-100 mt-1 opacity-80">
              {isAdmin ? "Você tem acesso completo ao sistema, incluindo relatórios com gráficos." : "Registre a temperatura e o pH da piscina abaixo."}
            </p>
          </div>
          <Thermometer className="absolute right-[-10px] bottom-[-20px] w-44 h-44 text-white/10 -rotate-12" />
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulário de Registro */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <Send className="w-5 h-5 text-blue-500" />
              Novo Registro
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Temperatura */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  autoFocus
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-5 py-4 text-3xl font-bold text-center text-orange-400 focus:border-orange-500/70 transition-all outline-none"
                  placeholder="28.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>

              {/* pH */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  pH da Água
                  <span className="text-slate-600 text-xs">(ideal: 7.0 – 7.6)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="14"
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-5 py-4 text-3xl font-bold text-center text-cyan-400 focus:border-cyan-500/70 transition-all outline-none"
                  placeholder="7.2"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                />
              </div>

              {/* Cloro */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <Droplets className="w-4 h-4 text-emerald-400" />
                  Nível de Cloro (ppm)
                  <span className="text-slate-600 text-xs">(ideal: 1.0 – 3.0)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-5 py-4 text-3xl font-bold text-center text-emerald-400 focus:border-emerald-500/70 transition-all outline-none"
                  placeholder="2.0"
                  value={cloro}
                  onChange={(e) => setCloro(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 text-white"
              >
                {loading ? "Gravando..." : "Confirmar Registro"}
              </button>

              {success && (
                <div className="flex items-center gap-2 justify-center text-green-400 text-sm font-medium animate-pulse">
                  <CheckCircle className="w-4 h-4" />
                  Registrado com sucesso!
                </div>
              )}
            </form>
          </div>

          {/* Última Leitura */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
            <h3 className="text-lg font-bold mb-4 text-white">Última Leitura</h3>
            {latest ? (
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Temperatura</p>
                    <span className="text-5xl font-black text-white italic">{latest.temperature.toFixed(1)}°C</span>
                  </div>
                  {latest.ph !== null && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">pH</p>
                      <span className={`text-5xl font-black italic ${
                        latest.ph < 7.0 ? "text-red-400" : latest.ph <= 7.6 ? "text-green-400" : "text-yellow-400"
                      }`}>{latest.ph.toFixed(2)}</span>
                    </div>
                  )}
                  {latest.cloro !== null && latest.cloro !== undefined && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Cloro</p>
                      <span className={`text-5xl font-black italic ${
                        latest.cloro < 1.0 ? "text-yellow-400" : latest.cloro <= 3.0 ? "text-emerald-400" : "text-red-400"
                      }`}>{latest.cloro.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="text-slate-400 text-sm space-y-1">
                  <p>Técnico: <span className="text-slate-200 font-medium">{latest.user?.name}</span></p>
                  <p>{format(new Date(latest.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic">Nenhum registro encontrado.</p>
            )}

            {isAdmin && (
              <Link
                to="/reports"
                className="mt-8 flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors border border-blue-500/30 rounded-lg py-2"
              >
                <BarChart2 className="w-4 h-4" />
                Ver Relatórios e Gráficos
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
