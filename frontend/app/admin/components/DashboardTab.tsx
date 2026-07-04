"use client";

import { useEffect, useState } from "react";
import { Activity, Users, DownloadCloud, TrendingUp, Loader2 } from "lucide-react";
import { client } from "@/client/client.gen";

// Статистика в реальном времени. Эндпоинт /admin/stats ещё не реализован
// на бэкенде — ошибки просто логируются, карточки ждут данные.
export default function DashboardTab() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await client.get({ url: '/api/v1/admin/stats', throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
        setStats(data as any);
      } catch (err) {
        console.error("Ошибка загрузки статистики", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-12 shadow-xl flex justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Realtime Stats */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mt-10 -mr-10 transition-colors group-hover:bg-green-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1 line-clamp-1">Игроков онлайн</p>
              <h3 className="text-3xl font-bold text-white font-mono">{stats.onlinePlayers}</h3>
            </div>
            <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-md w-max border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            В реальном времени
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mt-10 -mr-10 transition-colors group-hover:bg-blue-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1 line-clamp-1">На сайте сейчас</p>
              <h3 className="text-3xl font-bold text-white font-mono">{stats.websiteUsersNow}</h3>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md w-max border border-blue-500/20">
            Обновлено только что
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mt-10 -mr-10 transition-colors group-hover:bg-purple-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1 line-clamp-1">Скачиваний лаунчера</p>
              <h3 className="text-3xl font-bold text-white font-mono">{stats.launcherDownloads.toLocaleString()}</h3>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
              <DownloadCloud className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-400">
            <TrendingUp className="w-3 h-3" /> +12 за сегодня
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Посещения (Сегодня)</p>
              <h3 className="text-2xl font-bold text-white font-mono">{stats.websiteUsersDaily}</h3>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Посещения (Месяц)</p>
              <h3 className="text-2xl font-bold text-white font-mono">{stats.websiteUsersMonthly.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Всего регистраций</p>
              <h3 className="text-2xl font-bold text-white font-mono">{stats.totalRegistered.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
