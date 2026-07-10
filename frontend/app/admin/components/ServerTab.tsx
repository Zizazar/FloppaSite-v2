"use client";

import { useEffect, useMemo, useState } from "react";
import { Server, Save, CheckCircle2, AlertCircle, Loader2, Pin, Search } from "lucide-react";
import { client } from "@/client/client.gen";

interface ServerConfig {
  ip: string;
  name: string;
  description: string;
  version: string;
  launchDate: string;
  modLoader: string;
  modsRepoUrl: string;
  pinnedMods: string[];
}

const EMPTY_CONFIG: ServerConfig = {
  ip: "", name: "", description: "", version: "", launchDate: "", modLoader: "", modsRepoUrl: "", pinnedMods: [],
};

// Мод для выбора закрепления: ключ (filename) + отображаемое имя.
type PinOption = { key: string; name: string };

// Группируем записи packwiz по filename, как это делает список на главной.
function groupModOptions(entries: any[]): PinOption[] {
  const map = new Map<string, PinOption>();
  for (const e of entries) {
    const key = e.filename || e.name || e.page_url;
    if (!key) continue;
    const existing = map.get(key);
    // Имя из modrinth предпочтительнее (у curseforge бывает суффикс вроде "(NeoForge)").
    if (!existing) {
      map.set(key, { key, name: e.name || key });
    } else if (e.platform === "modrinth" && e.name) {
      existing.name = e.name;
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function ServerTab() {
  const [config, setConfig] = useState<ServerConfig>(EMPTY_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [modOptions, setModOptions] = useState<PinOption[]>([]);
  const [modsLoading, setModsLoading] = useState(true);
  const [pinSearch, setPinSearch] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await client.get({ url: '/api/v1/admin/server', throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
        setConfig({ ...EMPTY_CONFIG, ...(data as any) });
      } catch {
        setError("Не удалось загрузить конфигурацию");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Список модов для выбора закреплённых — обновляется при изменении URL репозитория (после сохранения).
  useEffect(() => {
    const fetchMods = async () => {
      setModsLoading(true);
      try {
        const { data } = await client.get({ url: '/api/v1/admin/mods', throwOnError: true });
        setModOptions(groupModOptions((data as any[]) ?? []));
      } catch {
        setModOptions([]);
      } finally {
        setModsLoading(false);
      }
    };
    fetchMods();
  }, []);

  const togglePin = (key: string) => {
    setConfig((c) => ({
      ...c,
      pinnedMods: c.pinnedMods.includes(key)
        ? c.pinnedMods.filter((k) => k !== key)
        : [...c.pinnedMods, key],
    }));
  };

  const filteredOptions = useMemo(() => {
    const q = pinSearch.trim().toLowerCase();
    if (!q) return modOptions;
    return modOptions.filter((m) => m.name.toLowerCase().includes(q));
  }, [modOptions, pinSearch]);

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
            <label className="block text-sm font-bold text-zinc-300 mb-2">URL репозитория модов (packwiz)</label>
            <input
              type="url"
              value={config.modsRepoUrl}
              onChange={(e) => setConfig({ ...config, modsRepoUrl: e.target.value })}
              placeholder="https://example.com/pack/mods.json"
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all font-mono"
            />
            <p className="text-zinc-500 text-xs mt-2">
              Ссылка на JSON-массив модов (packwiz export). Список показывается на главной странице в разделе «Список модов».
            </p>
          </div>

          <div className="md:col-span-2 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Pin className="w-4 h-4 text-red-500" />
              <label className="block text-sm font-bold text-zinc-300">Закреплённые моды</label>
              {config.pinnedMods.length > 0 && (
                <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">
                  Выбрано: {config.pinnedMods.length}
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-xs mb-3">
              Отмеченные моды показываются в начале списка крупными плитками со скриншотом из галереи. Не забудьте сохранить.
            </p>

            {modsLoading ? (
              <div className="py-8 flex justify-center border border-zinc-800 rounded-xl bg-zinc-950/50">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              </div>
            ) : modOptions.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-sm border border-zinc-800 rounded-xl bg-zinc-950/50">
                Список модов пуст. Укажите URL репозитория и сохраните, затем обновите страницу.
              </div>
            ) : (
              <div className="border border-zinc-800 rounded-xl bg-zinc-950/50 overflow-hidden">
                <div className="p-3 border-b border-zinc-800/80 relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    value={pinSearch}
                    onChange={(e) => setPinSearch(e.target.value)}
                    placeholder="Поиск мода..."
                    className="block w-full pl-8 pr-3 py-2 border border-zinc-800 rounded-lg bg-zinc-900/60 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all"
                  />
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60">
                  {filteredOptions.map((mod) => {
                    const checked = config.pinnedMods.includes(mod.key);
                    return (
                      <label
                        key={mod.key}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-zinc-900/60 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePin(mod.key)}
                          className="w-4 h-4 rounded accent-red-500 shrink-0"
                        />
                        <span className={`text-sm truncate ${checked ? "text-white font-medium" : "text-zinc-400"}`} title={mod.name}>
                          {mod.name}
                        </span>
                      </label>
                    );
                  })}
                  {filteredOptions.length === 0 && (
                    <div className="px-4 py-6 text-center text-zinc-500 text-sm">Ничего не найдено</div>
                  )}
                </div>
              </div>
            )}
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
