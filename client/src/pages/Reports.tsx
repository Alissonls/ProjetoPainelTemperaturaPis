import { useState, useEffect } from "react";
import api from "../api";
import { ChevronLeft, FileText, Calendar, Table as TableIcon, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Reports() {
  const [records, setRecords] = useState([]);
  const [type, setType] = useState<"weekly" | "monthly">("weekly");
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/${type}`);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [type]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-slate-400">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <FileText className="text-blue-500 w-10 h-10" />
                Relatórios Históricos
              </h1>
              <p className="text-slate-400 mt-1">Acompanhamento de registros de temperatura</p>
            </div>
          </div>

          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onClick={() => setType("weekly")}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                type === "weekly" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="w-5 h-5" />
              Semanal
            </button>
            <button
              onClick={() => setType("monthly")}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                type === "monthly" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="w-5 h-5" />
              Mensal
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-slate-800/50 p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-blue-400" />
              Listagem de Medições
            </h2>
            <button className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Exportar Dados
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                  <th className="px-8 py-5">Técnico Responsável</th>
                  <th className="px-8 py-5">Data do Registro</th>
                  <th className="px-8 py-5">Hora</th>
                  <th className="px-8 py-5">Temperatura</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                   [1,2,3].map(i => (
                     <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-8 py-6 bg-slate-800/20"></td>
                     </tr>
                   ))
                ) : records.length > 0 ? (
                  records.map((row: any) => (
                    <tr key={row.id} className="hover:bg-blue-500/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                            {row.user?.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-200">{row.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-slate-400">
                        {format(new Date(row.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-8 py-6 text-slate-400">
                        {format(new Date(row.createdAt), "HH:mm")}
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-2xl font-bold text-white italic group-hover:text-blue-400 transition-colors">
                          {row.value.toFixed(1)}°C
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                          Confirmado
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500 italic text-lg">
                      Nenhum registro encontrado para este período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          Fim da listagem • Mostrando {records.length} resultados
        </div>
      </div>
    </div>
  );
}
