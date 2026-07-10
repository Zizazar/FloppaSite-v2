"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ExternalLink, Package, Loader2, AlertCircle, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { client } from "@/client/client.gen";

// Одна запись из репозитория packwiz (одна запись на платформу/сторону).
type ModEntry = {
  name: string;
  version: string;
  filename: string;
  download_url: string;
  page_url: string;
  platform: string; // "modrinth" | "curseforge" | ...
  side: string; // "both" | "client" | "server"
};

// Данные, подтянутые из Modrinth API (иконка, описание, галерея).
type Enrichment = {
  title?: string;
  icon?: string;
  description?: string;
  gallery: string[]; // featured-картинка идёт первой
};

// Сгруппированный мод: объединяем записи одного мода с разных платформ в одну карточку.
type GroupedMod = {
  key: string; // filename — совпадает с pinnedMods из конфига
  name: string;
  side: string;
  modrinth?: string;
  curseforge?: string;
  modrinthId?: string; // id проекта Modrinth (последний сегмент page_url) — для обогащения
  icon?: string;
  description?: string;
  gallery: string[];
};

const SIDE_LABELS: Record<string, string> = {
  both: "Клиент + Сервер",
  client: "Только клиент",
  server: "Только сервер",
};

const PAGE_SIZE = 12;
const MODRINTH_API = "https://api.modrinth.com/v2";

// id проекта Modrinth — последний сегмент page_url (https://modrinth.com/mod/<id>).
function modrinthIdFromUrl(url: string): string | undefined {
  const m = url.match(/modrinth\.com\/[^/]+\/([^/?#]+)/i);
  return m ? m[1] : undefined;
}

// Один мод может встречаться дважды (modrinth + curseforge) — группируем по filename.
// Имя берём из modrinth-записи (у curseforge часто суффикс вроде "(NeoForge)").
function groupMods(entries: ModEntry[]): GroupedMod[] {
  const map = new Map<string, GroupedMod>();
  for (const e of entries) {
    const key = e.filename || e.name || e.page_url;
    let g = map.get(key);
    if (!g) {
      g = { key, name: e.name, side: e.side, gallery: [] };
      map.set(key, g);
    }
    if (e.platform === "modrinth") {
      g.modrinth = e.page_url;
      g.modrinthId = modrinthIdFromUrl(e.page_url);
      if (e.name) g.name = e.name;
    } else if (e.platform === "curseforge") {
      g.curseforge = e.page_url;
      if (!g.modrinth && e.name) g.name = e.name;
    }
  }
  return Array.from(map.values());
}

// Подтягиваем иконки/описания/галереи из Modrinth пачками (batch-эндпоинт).
async function fetchEnrichment(ids: string[]): Promise<Map<string, Enrichment>> {
  const result = new Map<string, Enrichment>();
  const CHUNK = 50;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const url = `${MODRINTH_API}/projects?ids=${encodeURIComponent(JSON.stringify(chunk))}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const projects: any[] = await resp.json();
      for (const p of projects) {
        const gallery: string[] = (p.gallery ?? [])
          .slice()
          .sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
          .map((g: any) => g.url)
          .filter(Boolean);
        const enr: Enrichment = { title: p.title, icon: p.icon_url || undefined, description: p.description, gallery };
        if (p.id) result.set(p.id, enr);
        if (p.slug) result.set(p.slug, enr);
      }
    } catch {
      // молча пропускаем — обогащение необязательно
    }
  }
  return result;
}

// --- Карточки ---------------------------------------------------------------

function ModIcon({ icon, name, size }: { icon?: string; name: string; size: string }) {
  const [broken, setBroken] = useState(false);
  if (icon && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icon}
        alt={name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={`${size} rounded-xl object-cover bg-zinc-800/80 border border-zinc-700/50 shrink-0`}
      />
    );
  }
  return (
    <div className={`${size} rounded-xl bg-zinc-800/80 border border-zinc-700/50 shrink-0 flex items-center justify-center`}>
      <Package className="w-1/2 h-1/2 text-zinc-500" />
    </div>
  );
}

function PlatformLinks({ mod }: { mod: GroupedMod }) {
  return (
    <>
      {mod.modrinth && (
        <a
          href={mod.modrinth}
          target="_blank"
          rel="noreferrer"
          title="Открыть на Modrinth"
          className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
        >
          Modrinth <ExternalLink className="w-3 h-3" />
        </a>
      )}
      {mod.curseforge && (
        <a
          href={mod.curseforge}
          target="_blank"
          rel="noreferrer"
          title="Открыть на CurseForge"
          className="text-xs font-semibold bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-zinc-950 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
        >
          CurseForge <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </>
  );
}

function SideBadge({ side }: { side: string }) {
  if (!side || !SIDE_LABELS[side]) return null;
  return (
    <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-800/60 border border-zinc-700/50 px-2 py-0.5 rounded-md">
      {SIDE_LABELS[side]}
    </span>
  );
}

// Крупная плитка закреплённого мода со скриншотом из галереи.
function PinnedCard({ mod }: { mod: GroupedMod }) {
  const shot = mod.gallery[0];
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-green-500/50 transition-all group flex flex-col shadow-lg shadow-black/20">
      <div className="relative aspect-video bg-gradient-to-br from-zinc-800/60 to-zinc-900 overflow-hidden">
        {shot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shot}
            alt={mod.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-zinc-700" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1 text-[11px] font-bold text-green-300 bg-green-950/70 backdrop-blur border border-green-500/30 px-2 py-1 rounded-md">
            <Pin className="w-3 h-3" /> Рекомендуем
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex gap-3 items-center mb-2 -mt-8 relative">
          <ModIcon icon={mod.icon} name={mod.name} size="w-14 h-14" />
          <h3 className="text-lg font-bold text-white leading-tight pt-6 truncate group-hover:text-green-400 transition-colors" title={mod.name}>
            {mod.name}
          </h3>
        </div>
        {mod.description && (
          <p className="text-sm text-zinc-400 leading-snug line-clamp-2 mb-4">{mod.description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <SideBadge side={mod.side} />
          <div className="flex gap-1.5 ml-auto">
            <PlatformLinks mod={mod} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Компактная карточка мода для основного списка.
function ModCard({ mod }: { mod: GroupedMod }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 hover:border-green-500/40 hover:bg-zinc-900/70 transition-all group flex flex-col">
      <div className="flex gap-3 items-start mb-3">
        <ModIcon icon={mod.icon} name={mod.name} size="w-11 h-11" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-white leading-tight truncate group-hover:text-green-400 transition-colors" title={mod.name}>
            {mod.name}
          </h3>
          {mod.description && (
            <p className="text-xs text-zinc-500 leading-snug line-clamp-2 mt-0.5">{mod.description}</p>
          )}
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <SideBadge side={mod.side} />
        <div className="flex gap-1.5 ml-auto">
          <PlatformLinks mod={mod} />
        </div>
      </div>
    </div>
  );
}

export default function ModsList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<ModEntry[]>([]);
  const [pinnedKeys, setPinnedKeys] = useState<string[]>([]);
  const [enrichment, setEnrichment] = useState<Map<string, Enrichment>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [modsRes, cfgRes] = await Promise.all([
          client.get({ url: "/api/v1/admin/mods", throwOnError: true }),
          client.get({ url: "/api/v1/admin/server", throwOnError: true }),
        ]);
        setEntries((modsRes.data as ModEntry[]) ?? []);
        setPinnedKeys(((cfgRes.data as any)?.pinnedMods as string[]) ?? []);
      } catch {
        setError("Не удалось загрузить список модов");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const mods = useMemo(() => groupMods(entries), [entries]);

  // Обогащаем моды иконками/описаниями из Modrinth после загрузки списка.
  useEffect(() => {
    if (mods.length === 0) return;
    const ids = Array.from(new Set(mods.map((m) => m.modrinthId).filter(Boolean) as string[]));
    if (ids.length === 0) return;
    let cancelled = false;
    fetchEnrichment(ids).then((map) => {
      if (!cancelled) setEnrichment(map);
    });
    return () => {
      cancelled = true;
    };
  }, [mods]);

  // Применяем обогащение к сгруппированным модам.
  const enrichedMods = useMemo(() => {
    if (enrichment.size === 0) return mods;
    return mods.map((m) => {
      const enr = m.modrinthId ? enrichment.get(m.modrinthId) : undefined;
      if (!enr) return m;
      return {
        ...m,
        name: m.name || enr.title || m.name,
        icon: enr.icon,
        description: enr.description,
        gallery: enr.gallery,
      };
    });
  }, [mods, enrichment]);

  const pinnedSet = useMemo(() => new Set(pinnedKeys), [pinnedKeys]);

  const pinnedMods = useMemo(
    () => enrichedMods.filter((m) => pinnedSet.has(m.key)),
    [enrichedMods, pinnedSet]
  );
  const regularMods = useMemo(
    () => enrichedMods.filter((m) => !pinnedSet.has(m.key)),
    [enrichedMods, pinnedSet]
  );

  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  // При поиске показываем плоский список всех совпадений (без разделения на закреплённые).
  const matches = useMemo(() => {
    if (!isSearching) return regularMods;
    return enrichedMods.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        (m.description ?? "").toLowerCase().includes(query)
    );
  }, [isSearching, enrichedMods, regularMods, query]);

  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section id="mods" className="py-24 relative z-10 bg-zinc-950 border-t border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">Список модов</h2>
          <div className="w-24 h-1 bg-green-500 mx-auto rounded-full mb-8"></div>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg mb-8">
            Ознакомьтесь с модификациями, которые делают наш сервер уникальным.
            {mods.length > 0 && (
              <span className="text-green-400 font-semibold"> Всего модов: {mods.length}.</span>
            )}
          </p>

          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all shadow-inner"
              placeholder="Поиск по названию или описанию..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-red-500/70 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">{error}</h3>
            <p className="text-zinc-500 mt-1">Проверьте URL репозитория в панели администратора.</p>
          </div>
        ) : mods.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">Список модов пуст</h3>
            <p className="text-zinc-500 mt-1">Репозиторий модов ещё не настроен.</p>
          </div>
        ) : (
          <>
            {/* Закреплённые моды — крупными плитками, только вне режима поиска */}
            {!isSearching && pinnedMods.length > 0 && (
              <div className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedMods.map((mod) => (
                    <PinnedCard key={mod.key} mod={mod} />
                  ))}
                </div>
              </div>
            )}

            {/* Основной список с пагинацией */}
            {pageItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pageItems.map((mod) => (
                  <ModCard key={mod.key} mod={mod} />
                ))}
              </div>
            ) : (
              <div className="col-span-full py-12 text-center">
                <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">Моды не найдены</h3>
                <p className="text-zinc-500 mt-1">Попробуйте изменить запрос поиска</p>
              </div>
            )}

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-sm font-medium hover:border-green-500/40 hover:text-white disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:text-zinc-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers(currentPage, totalPages).map((p, i) =>
                    p === "..." ? (
                      <span key={`gap-${i}`} className="px-2 text-zinc-600">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`min-w-9 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          p === currentPage
                            ? "bg-green-500 text-zinc-950 border border-green-500"
                            : "bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:border-green-500/40 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-sm font-medium hover:border-green-500/40 hover:text-white disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:text-zinc-300 transition-colors"
                >
                  Вперёд <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// Номера страниц с многоточиями: 1 … 4 5 [6] 7 8 … 20
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}
