"use client";

import { useEffect, useState } from "react";
import { Server, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { client } from "@/client/client.gen";
import ModSelector, { Mod } from "@/components/ModSelector";

interface ServerConfig {
  ip: string;
  name: string;
  description: string;
  version: string;
  launchDate: string;
  modLoader: string;
  mods: Mod[];
}

const EMPTY_CONFIG: ServerConfig = {
  ip: "", name: "", description: "", version: "", launchDate: "", modLoader: "", mods: [],
};

export default function ServerTab() {
  const [config, setConfig] = useState<ServerConfig>(EMPTY_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await client.get({ url: '/api/v1/admin/server', throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
        // Страхуемся, чтобы mods всегда был массивом (ModSelector ожидает массив).
        setConfig({ ...EMPTY_CONFIG, ...(data as any), mods: (data as any)?.mods ?? [] });
      } catch {
        setError("Не удалось загрузить конфигурацию");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);
    try {
      await client.put({ url: '/api/v1/admin/server', body: config, throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-12 shadow-xl flex justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Server className="w-6 h-6 text-red-500" />
        <div>
          <h3 className="text-xl font-bold text-white">Настройки мониторинга</h3>
          <p className="text-zinc-400 text-sm">Эти данные отображаются на главной странице</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>Настройки успешно сохранены!</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Название сервера</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">IP Адрес</label>
            <input
              type="text"
              value={config.ip}
              onChange={(e) => setConfig({ ...config, ip: e.target.value })}
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Версия игры</label>
            <input
              type="text"
              value={config.version}
              onChange={(e) => setConfig({ ...config, version: e.target.value })}
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Загрузчик модов</label>
            <select
              value={config.modLoader}
              onChange={(e) => setConfig({ ...config, modLoader: e.target.value })}
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
            >
              <option value="Fabric">Fabric</option>
              <option value="Forge">Forge</option>
              <option value="Quilt">Quilt</option>
              <option value="NeoForge">NeoForge</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-300 mb-2">Описание</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              rows={3}
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-300 mb-2">Дата последнего вайпа</label>
            <input
              type="date"
              value={config.launchDate}
              onChange={(e) => setConfig({ ...config, launchDate: e.target.value })}
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <label className="block text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2">
              Список модов
              <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-md border border-red-500/20">{config.mods.length}</span>
            </label>
            <ModSelector
              selectedMods={config.mods}
              onChange={(mods) => setConfig({ ...config, mods })}
            />
          </div>
        </div>

        <div className="pt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-900/20 active:scale-95"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
