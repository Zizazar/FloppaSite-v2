"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Users, Activity, Zap, Loader2 } from "lucide-react";
import { client } from "@/client/client.gen";

export default function ServerInfo() {
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const [configResp, statsResp] = await Promise.all([
          client.get({ url: '/api/v1/admin/server', throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] }),
          client.get({ url: '/api/v1/admin/stats', throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] })
        ]);
        setConfig((configResp as any).data);
        setStats((statsResp as any).data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    interval = setInterval(fetchData, 10000); // refresh every 10s

    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    if (config?.ip) {
      navigator.clipboard.writeText(config.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calculateDaysAgo = (dateStr: string) => {
    if (!dateStr) return "Н/Д";
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} дн. назад`;
  };

  return (
    <section id="info" className="py-24 relative z-10 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">О сервере</h2>
          <div className="w-24 h-1 bg-green-500 mx-auto rounded-full mb-8"></div>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg hover:text-zinc-300 transition-colors">
            {config?.description || "Загрузка информации о сервере..."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="mt-1 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Надежность и стабильность</h3>
                <p className="text-zinc-400">Наш сервер работает 24/7 на мощном оборудовании, обеспечивая комфортную игру без лагов и задержек даже при высоком онлайне.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="mt-1 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Оптимизированная сборка</h3>
                <p className="text-zinc-400">Мы тщательно подобрали и настроили моды. Ничего лишнего, только то, что делает игру по-настоящему захватывающей.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="mt-1 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Адекватное комьюнити</h3>
                <p className="text-zinc-400">Администрация следит за порядком и всегда готова помочь. У нас запрещены читы и гриферство, играй спокойно!</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Статус сервера ({config?.name || '...'})</p>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <h4 className="text-xl font-bold text-white">Онлайн</h4>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-sm mb-1">Игроков</p>
                  <h4 className="text-xl font-bold text-white font-mono">
                    <span className="text-green-500">{stats ? stats.onlinePlayers : '--'}</span> / 100
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Версия</p>
                  <p className="text-white font-bold font-mono">{config ? config.version : '--'}</p>
                </div>
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Ядро</p>
                  <p className="text-white font-bold font-mono">{config ? config.modLoader : '--'}</p>
                </div>
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Аптайм</p>
                  <p className="text-white font-bold font-mono">99.9%</p>
                </div>
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Вайп был</p>
                  <p className="text-white font-bold font-mono">{config ? calculateDaysAgo(config.launchDate) : '--'}</p>
                </div>
              </div>

              <button 
                onClick={handleCopy}
                className="mt-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 flex items-center justify-between group cursor-pointer hover:border-green-500/50 transition-colors w-full text-left"
              >
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">IP Адрес</p>
                  <p className="text-white font-bold font-mono">{config ? config.ip : '--'}</p>
                </div>
                <div className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${copied ? 'bg-green-500 text-zinc-950' : 'bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-zinc-950'}`}>
                  {copied ? 'СКОПИРОВАНО' : 'КОПИРОВАТЬ'}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
