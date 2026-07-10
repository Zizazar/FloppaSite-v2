"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Users, Zap } from "lucide-react";
import { client } from "@/client/client.gen";
import { avatarUrl } from "@/lib/skin";

type PlayerSample = { name: string; uuid: string };
type ServerStatus = {
  online: boolean;
  playersOnline: number;
  playersMax: number;
  latencyMs: number;
  version: string;
  players: PlayerSample[];
};

// Голова игрока из своей системы скинов (по нику). Если игрока нет в базе сайта —
// эндпоинт вернёт 404, и мы покажем запасную плитку с первой буквой ника.
function PlayerHead({ player }: { player: PlayerSample }) {
  const [broken, setBroken] = useState(false);
  const src = avatarUrl(player.name);

  return (
    <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800/60 rounded-lg pl-1.5 pr-3 py-1.5 hover:border-green-500/40 transition-colors">
      {broken ? (
        <div className="w-7 h-7 rounded bg-green-500/15 border border-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold shrink-0">
          {player.name.charAt(0).toUpperCase()}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={player.name}
          width={28}
          height={28}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="w-7 h-7 rounded shrink-0 [image-rendering:pixelated]"
        />
      )}
      <span className="text-sm font-medium text-zinc-200 truncate max-w-[10rem]" title={player.name}>
        {player.name}
      </span>
    </div>
  );
}

export default function ServerInfo() {
  const [config, setConfig] = useState<any>(null);
  const [status, setStatus] = useState<ServerStatus | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await client.get({ url: "/api/v1/admin/server", throwOnError: true });
        setConfig(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchStatus = async () => {
      try {
        const { data } = await client.get({ url: "/api/v1/admin/status", throwOnError: true });
        setStatus(data as ServerStatus);
      } catch (err) {
        console.error(err);
      }
    };

    fetchConfig();
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // живой пинг раз в 15с
    return () => clearInterval(interval);
  }, []);

  const online = status?.online ?? false;

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
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 ${online ? "bg-green-500/10" : "bg-red-500/10"}`}></div>
            <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl -ml-20 -mb-20 ${online ? "bg-green-500/10" : "bg-red-500/10"}`}></div>

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Статус сервера ({config?.name || "..."})</p>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      {online && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${online ? "bg-green-500" : "bg-red-500"}`}></span>
                    </span>
                    <h4 className="text-xl font-bold text-white">{online ? "Онлайн" : "Оффлайн"}</h4>
                    {online && status && status.latencyMs > 0 && (
                      <span className="text-xs text-zinc-500 font-mono ml-1">{status.latencyMs} ms</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-sm mb-1">Игроков</p>
                  <h4 className="text-xl font-bold text-white font-mono">
                    <span className={online ? "text-green-500" : "text-zinc-600"}>
                      {online && status ? status.playersOnline : "--"}
                    </span>{" "}
                    / {online && status ? status.playersMax : "--"}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Версия</p>
                  <p className="text-white font-bold font-mono">{config ? config.version : "--"}</p>
                </div>
                <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Ядро</p>
                  <p className="text-white font-bold font-mono">{config ? config.modLoader : "--"}</p>
                </div>
              </div>

              {/* Живой список игроков онлайн */}
              <div className="bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-green-500" />
                  <p className="text-zinc-400 text-sm font-semibold">Сейчас играют</p>
                </div>

                {!online ? (
                  <p className="text-zinc-600 text-sm">Сервер недоступен</p>
                ) : status && status.players.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {status.players.map((p) => (
                      <PlayerHead key={p.uuid + p.name} player={p} />
                    ))}
                    {status.playersOnline > status.players.length && (
                      <div className="flex items-center px-3 py-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-sm text-zinc-400">
                        +{status.playersOnline - status.players.length} ещё
                      </div>
                    )}
                  </div>
                ) : status && status.playersOnline > 0 ? (
                  <p className="text-zinc-500 text-sm">Онлайн {status.playersOnline}, но сервер не отдаёт список ников</p>
                ) : (
                  <p className="text-zinc-500 text-sm">Сейчас никто не играет — заходи первым! 🎮</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
