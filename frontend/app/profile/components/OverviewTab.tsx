import { Clock } from "lucide-react";

// Обзор — игровая статистика и последние действия.
// Пока это статические данные-заглушки (API ещё не готов).
export default function OverviewTab() {
  return (
    <>
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-bold text-white">Игровая статистика</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/50">
            <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Наиграно</p>
            <p className="text-white font-bold font-mono text-xl">42 ч.</p>
          </div>
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/50">
            <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Убийств</p>
            <p className="text-white font-bold font-mono text-xl">156</p>
          </div>
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/50">
            <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Смертей</p>
            <p className="text-white font-bold font-mono text-xl">34</p>
          </div>
          <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/50">
            <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">Сломано</p>
            <p className="text-white font-bold font-mono text-xl">15.4k</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6">Последние действия</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-white font-medium text-sm">Вход на сервер FloppaLand Survival</p>
                  <p className="text-zinc-500 text-xs mt-1">IP: 121.34.***.***</p>
                </div>
              </div>
              <span className="text-zinc-500 text-sm font-mono">{i === 0 ? 'Сегодня, 14:30' : i === 1 ? 'Вчера, 20:15' : '3 дня назад'}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
