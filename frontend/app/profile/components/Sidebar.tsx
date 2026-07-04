"use client";

import Image from "next/image";
import { Settings, LogOut, Shield, User, Shirt } from "lucide-react";
import type { UserResponse } from "@/client";
import LogoutButton from "@/components/LogoutButton";
import { avatarUrl } from "@/lib/skin";
import type { TabType } from "../types";

interface SidebarProps {
  user: UserResponse;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  avatarTimestamp: number;
}

const navItemClass = (isActive: boolean) =>
  `flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors ${
    isActive ? 'bg-green-500/10 text-green-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
  }`;

export default function Sidebar({ user, activeTab, setActiveTab, avatarTimestamp }: SidebarProps) {
  // avatarTimestamp меняется после загрузки нового скина → браузер скачивает свежий аватар.
  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 text-center shadow-xl">
        <div className="relative w-32 h-32 mx-auto mb-4 group">
          <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl group-hover:bg-green-500/30 transition-colors"></div>
          <Image
            src={avatarUrl(user.username, avatarTimestamp)}
            alt="Player Skin"
            width={128}
            height={128}
            className="relative rounded-2xl border-2 border-zinc-800 transition-colors rendering-pixelated"
            referrerPolicy="no-referrer"
            unoptimized
          />
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
          <Shield className="w-3 h-3" /> ИГРОК
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-4 shadow-xl">
        <nav className="space-y-1">
          <button onClick={() => setActiveTab('overview')} className={navItemClass(activeTab === 'overview')}>
            <User className="w-5 h-5" />
            Обзор
          </button>
          <button onClick={() => setActiveTab('skin')} className={navItemClass(activeTab === 'skin')}>
            <Shirt className="w-5 h-5" />
            Скин
          </button>
          <button onClick={() => setActiveTab('settings')} className={navItemClass(activeTab === 'settings')}>
            <Settings className="w-5 h-5" />
            Настройки
          </button>
          <LogoutButton className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-4">
            <LogOut className="w-5 h-5" />
            Выйти
          </LogoutButton>
        </nav>
      </div>
    </div>
  );
}
