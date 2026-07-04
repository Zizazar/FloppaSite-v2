import Image from "next/image";
import { Settings, LogOut, Shield, User, Shirt } from "lucide-react";

export default function Sidebar({ user, activeTab, setActiveTab, avatarTimestamp }: any) {
  // МАГИЯ ЗДЕСЬ: добавляем &t=timestamp. Когда timestamp меняется, Next.js скачает новую картинку.
  const avatarUrl = `/api/v1/skin/avatar?name=${user.username}&t=${avatarTimestamp}`;

  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 text-center shadow-xl">
        <div className="relative w-32 h-32 mx-auto mb-4 group">
          <Image 
            src={avatarUrl}
            alt="Player Skin" 
            width={128} 
            height={128} 
            className="relative rounded-2xl border-2 border-zinc-800 rendering-pixelated"
            unoptimized // ВАЖНО: для динамических аватаров лучше отключить оптимизацию next/image
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
        {/* ... остальной код (бейджик и т.д.) ... */}
      </div>

      {/* Меню навигации */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-4 shadow-xl">
        <nav className="space-y-1">
          <button onClick={() => setActiveTab('overview')} className={`...`}>Обзор</button>
          <button onClick={() => setActiveTab('skin')} className={`...`}>Скин</button>
          <button onClick={() => setActiveTab('settings')} className={`...`}>Настройки</button>
        </nav>
      </div>
    </div>
  );
}