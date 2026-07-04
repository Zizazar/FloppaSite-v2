"use client";

import { BarChart3, Users, Server, Archive } from "lucide-react";
import type { AdminTab } from "../types";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

const itemClass = (isActive: boolean) =>
  `flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors ${
    isActive
      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent'
  }`;

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-4 shadow-xl">
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={itemClass(activeTab === 'dashboard')}>
            <BarChart3 className="w-5 h-5" />
            Статистика
          </button>
          <button onClick={() => setActiveTab('users')} className={itemClass(activeTab === 'users')}>
            <Users className="w-5 h-5" />
            Пользователи
          </button>
          <button onClick={() => setActiveTab('server')} className={itemClass(activeTab === 'server')}>
            <Server className="w-5 h-5" />
            Мониторинг
          </button>
          <button onClick={() => setActiveTab('archive')} className={itemClass(activeTab === 'archive')}>
            <Archive className="w-5 h-5" />
            Архивы
          </button>
        </nav>
      </div>
    </div>
  );
}
