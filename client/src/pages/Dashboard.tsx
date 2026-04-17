import { useState, useEffect } from "react";
import api from "../api";
import { LogOut, Thermometer, History, Send, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const [temp, setTemp] = useState("");
  const [latest, setLatest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const fetchLatest = async () => {
    try {
      const { data } = await api.get("/temperature/latest");
      setLatest(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temp) return;
    setLoading(true);
    try {
      await api.post("/temperature", { value: temp });
      setTemp("");
      fetchLatest();
      alert("Temperatura registrada com sucesso!");
    } catch (err) {
      alert("Erro ao registrar temperatura");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Thermometer className="text-blue-500 w-6 h-6" />
          <span className="font-bold text-xl tracking-tight">PoolControl</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Olá, {user.name}!</h2>
            <p className="text-blue-100 opacity-90">Registre a temperatura atual da piscina no formulário abaixo.</p>
          </div>
          <Thermometer className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/10 -rotate-12" />
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Card */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" />
              Novo Registro
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Temperatura (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  autoFocus
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-6 py-4 text-4xl font-bold text-center text-blue-400 focus:border-blue-500 transition-all outline-none"
                  placeholder="28.5"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {loading ? "Gravando..." : "Confirmar Registro"}
              </button>
            </form>
          </div>

          {/* Latest Status */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-green-500" />
                Última Leitura
              </h3>
              {latest ? (
                <div className="space-y-4">
                  <div className="text-6xl font-black text-white italic">
                    {latest.value.toFixed(1)}°C
                  </div>
                  <div className="text-slate-400">
                    <p className="text-sm">Registrado por: <span className="text-slate-200">{latest.user?.name}</span></p>
                    <p className="text-sm">
                      {format(new Date(latest.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">Nenhum registro encontrado.</p>
              )}
            </div>
            
            <Link 
              to="/reports" 
              className="mt-8 flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors border border-blue-500/30 rounded-lg py-2"
            >
              Ver Relatórios Semanal/Mensal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
