import { useState, useEffect } from "react";
import { Thermometer, Clock, Droplets } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import Pusher from "pusher-js";
import api from "../api";

export default function Panel() {
  const [data, setData] = useState<any>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Relógio em tempo real
    const timer = setInterval(() => setNow(new Date()), 1000);

    // Última leitura ao carregar
    api.get("/records/latest").then((res) => setData(res.data));

    // Pusher — atualizações em tempo real via Vercel/Pusher
    const pusherKey = import.meta.env.VITE_PUSHER_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;

    let channel: any = null;
    let pusherClient: any = null;

    if (pusherKey && pusherCluster) {
      pusherClient = new Pusher(pusherKey, { cluster: pusherCluster });
      channel = pusherClient.subscribe("pool-channel");
      channel.bind("new-record", (record: any) => {
        setData(record);
      });
    } else {
      // Fallback local: WebSocket para desenvolvimento sem Pusher configurado
      try {
        const socket = new WebSocket("ws://localhost:3001/ws");
        socket.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === "NEW_RECORD") setData(msg.data);
        };
        (window as any).__ws = socket;
      } catch {}
    }

    return () => {
      clearInterval(timer);
      if (channel) channel.unbind_all();
      if (pusherClient) pusherClient.disconnect();
      if ((window as any).__ws) (window as any).__ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-12 overflow-hidden select-none">
      {/* Fundo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center">
        {/* Header bar */}
        <div className="w-full flex justify-between items-center mb-16 text-slate-400 font-medium text-3xl">
          <div className="flex items-center gap-4 bg-slate-900/40 px-8 py-4 rounded-3xl border border-slate-800 backdrop-blur-md">
            <Clock className="w-8 h-8 text-blue-500" />
            <span>{format(now, "HH:mm:ss")}</span>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/40 px-8 py-4 rounded-3xl border border-slate-800 backdrop-blur-md">
            <span>{format(now, "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
          </div>
        </div>

        {/* Display principal */}
        <div className="flex flex-col items-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 text-blue-500 mb-4"
          >
            <Thermometer className="w-20 h-20" />
            <h1 className="text-5xl font-bold uppercase tracking-[0.2em]">Temperatura da Piscina</h1>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={data?.id || "empty"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-[28rem] font-black leading-none text-white drop-shadow-[0_0_80px_rgba(59,130,246,0.5)] tabular-nums flex"
            >
              {data ? data.temperature.toFixed(1) : "00.0"}
              <span className="text-8xl mt-24 text-blue-500 font-bold">°C</span>
            </motion.div>
          </AnimatePresence>

          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex items-center gap-8 bg-slate-900/60 px-12 py-6 rounded-full border border-blue-500/20 backdrop-blur-xl"
            >
              <div className="text-3xl text-slate-300">
                Última atualização às <strong className="text-white ml-2">{format(new Date(data.createdAt), "HH:mm")}</strong>
              </div>
              {data.ph !== null && data.ph !== undefined && (
                <>
                  <div className="w-2 h-2 bg-slate-700 rounded-full" />
                  <div className="flex items-center gap-3 text-3xl text-slate-300">
                    <Droplets className="w-7 h-7 text-cyan-400" />
                    pH: <strong className="text-cyan-400 ml-2">{data.ph?.toFixed(2)}</strong>
                  </div>
                </>
              )}
              {data.cloro !== null && data.cloro !== undefined && (
                <>
                  <div className="w-2 h-2 bg-slate-700 rounded-full" />
                  <div className="flex items-center gap-3 text-3xl text-slate-300">
                    <Droplets className="w-7 h-7 text-emerald-400" />
                    Cloro: <strong className="text-emerald-400 ml-2">{data.cloro?.toFixed(1)}</strong>
                    <span className="text-xl text-slate-500 ml-1">ppm</span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
        <span className="text-2xl font-bold text-white tracking-widest">POOLCONTROL SYSTEM</span>
      </div>
    </div>
  );
}
