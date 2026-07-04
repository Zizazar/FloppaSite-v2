"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import AdminSidebar from "./components/AdminSidebar";
import DashboardTab from "./components/DashboardTab";
import UsersTab from "./components/UsersTab";
import ServerTab from "./components/ServerTab";
import ArchiveTab from "./components/ArchiveTab";
import type { AdminTab } from "./types";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
          <ShieldAlert className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white font-display">Панель управления</h1>
          <p className="text-zinc-400">Система администрирования сервера</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="lg:col-span-3">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'server' && <ServerTab />}
          {activeTab === 'archive' && <ArchiveTab />}
        </div>
      </div>
    </div>
  );
}
