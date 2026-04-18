import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  ArrowLeft, Thermometer, Droplets, CalendarDays,
  CalendarRange, Users, TrendingUp, BarChart2, Activity
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS_TEMP = ["#38bdf8", "#22d3ee", "#f59e0b", "#ef4444"];
const COLORS_PH   = ["#f87171", "#34d399", "#fbbf24", "#94a3b8"];
const COLORS_TECH = ["#818cf8", "#f472b6", "#34d399", "#fb923c", "#38bdf8"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-300 font-bold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const PERIOD_LABEL = { weekly: "Semana Atual", monthly: "Mês Atual" };

export default function Reports() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [chart, setChart] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin" || (!user.role && user.username === "admin");
    if (!isAdmin) navigate("/");
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/reports/chart?period=${period}`),
      api.get(`/reports/${period}`),
    ])
      .then(([chartRes, listRes]) => {
        setChart(chartRes.data);
        setRecords(listRes.data);
      })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <BarChart2 className="text-amber-400 w-5 h-5" />
          <span className="font-bold text-lg text-white">Relatórios</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">ADMIN</span>
        </div>

        {/* Período */}
        <div className="ml-auto flex items-center gap-2 bg-slate-800 rounded-xl p-1">
          {(["weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              {p === "weekly" ? <CalendarDays className="w-4 h-4" /> : <CalendarRange className="w-4 h-4" />}
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: <Activity className="w-5 h-5 text-blue-400" />,
                  label: "Total de Registros",
                  value: chart?.total ?? 0,
                  color: "blue",
                },
                {
                  icon: <Thermometer className="w-5 h-5 text-orange-400" />,
                  label: "Temp. Média",
                  value: chart?.timeline?.length
                    ? `${(chart.timeline.reduce((s: number, d: any) => s + d.tempMedia, 0) / chart.timeline.length).toFixed(1)}°C`
                    : "—",
                  color: "orange",
                },
                {
                  icon: <Droplets className="w-5 h-5 text-cyan-400" />,
                  label: "pH Médio",
                  value: (() => {
                    const phs = chart?.timeline?.filter((d: any) => d.phMedio !== null).map((d: any) => d.phMedio);
                    return phs?.length ? (phs.reduce((a: number, b: number) => a + b, 0) / phs.length).toFixed(2) : "—";
                  })(),
                  color: "cyan",
                },
                {
                  icon: <Users className="w-5 h-5 text-violet-400" />,
                  label: "Técnicos Ativos",
                  value: chart?.byTechnician?.length ?? 0,
                  color: "violet",
                },
              ].map((kpi, i) => (
                <div key={i} className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                  <div className="flex items-center gap-2 mb-3">{kpi.icon}<span className="text-slate-400 text-xs">{kpi.label}</span></div>
                  <p className="text-3xl font-black text-white">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Gráfico de Linha — Temperatura e pH */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" /> Evolução Diária
              </h3>
              <p className="text-slate-500 text-xs mb-5">{PERIOD_LABEL[period]}</p>
              {chart?.timeline?.length ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chart.timeline} margin={{ right: 20, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="dia" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis yAxisId="temp" domain={["auto", "auto"]} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `${v}°`} />
                    <YAxis yAxisId="ph" orientation="right" domain={[6, 8.5]} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px", color: "#94a3b8" }} />
                    <Line yAxisId="temp" type="monotone" dataKey="tempMedia" name="Temp. Média (°C)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: "#f59e0b" }} />
                    <Line yAxisId="temp" dataKey="tempMax" name="Temp. Máx." stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                    <Line yAxisId="temp" dataKey="tempMin" name="Temp. Mín." stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                    <Line yAxisId="ph" type="monotone" dataKey="phMedio" name="pH Médio" stroke="#34d399" strokeWidth={2.5} dot={{ r: 4, fill: "#34d399" }} connectNulls />
                    <ReferenceLine yAxisId="ph" y={7.0} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: "pH 7.0", fill: "#94a3b8", fontSize: 10 }} />
                    <ReferenceLine yAxisId="ph" y={7.6} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: "pH 7.6", fill: "#94a3b8", fontSize: 10 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-16 italic">Sem registros no período</p>
              )}
            </div>

            {/* Gráficos de Segmento */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Distribuição de Temperatura */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <h3 className="text-white font-bold mb-1 text-sm flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" /> Faixas de Temperatura
                </h3>
                <p className="text-slate-500 text-xs mb-4">Distribuição dos registros</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie 
                      data={chart?.tempDistribution?.filter((d: any) => d.count > 0)} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={70} 
                      dataKey="count" 
                      nameKey="range" 
                      label={({ percent, name }: any) => (percent && percent > 0) ? `${(percent * 100).toFixed(0)}%` : name} 
                      labelLine={false}
                    >
                      {chart?.tempDistribution?.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS_TEMP[i % COLORS_TEMP.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [val, name]} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Distribuição de pH */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <h3 className="text-white font-bold mb-1 text-sm flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" /> Faixas de pH
                </h3>
                <p className="text-slate-500 text-xs mb-4">Qualidade da água</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie 
                      data={chart?.phDistribution?.filter((d: any) => d.count > 0)} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={70} 
                      dataKey="count" 
                      nameKey="range" 
                      label={({ percent, name }: any) => (percent && percent > 0) ? `${(percent * 100).toFixed(0)}%` : name} 
                      labelLine={false}
                    >
                      {chart?.phDistribution?.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS_PH[i % COLORS_PH.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Registros por Técnico */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <h3 className="text-white font-bold mb-1 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-400" /> Registros por Técnico
                </h3>
                <p className="text-slate-500 text-xs mb-4">Participação no período</p>
                {chart?.byTechnician?.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chart.byTechnician} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "12px" }} />
                      <Bar dataKey="count" name="Registros" radius={[0, 6, 6, 0]}>
                        {chart.byTechnician.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS_TECH[i % COLORS_TECH.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500 text-center py-16 italic text-sm">Sem dados</p>
                )}
              </div>
            </div>

            {/* Tabela de Histórico */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-slate-400" /> Histórico de Registros
                </h3>
                <span className="text-xs text-slate-500">{records.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800 text-left">
                      <th className="px-6 py-3 font-medium">Data / Hora</th>
                      <th className="px-6 py-3 font-medium">Técnico</th>
                      <th className="px-6 py-3 font-medium text-center">Temperatura</th>
                      <th className="px-6 py-3 font-medium text-center">pH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-12 text-slate-500 italic">Nenhum registro no período</td></tr>
                    ) : (
                      records.map((r: any) => (
                        <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 text-slate-300">
                            {format(new Date(r.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-medium">{r.user?.name}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-orange-400">{r.temperature.toFixed(1)}°C</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {r.ph !== null ? (
                              <span className={`font-bold ${
                                r.ph < 7.0 ? "text-red-400" : r.ph <= 7.6 ? "text-green-400" : "text-yellow-400"
                              }`}>{r.ph.toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-600 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
