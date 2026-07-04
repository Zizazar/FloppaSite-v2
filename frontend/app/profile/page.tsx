"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Sidebar from "./components/Sidebar";
import OverviewTab from "./components/OverviewTab";
import SkinTab from "./components/SkinTab";
import SettingsTab from "./components/SettingsTab";
import type { TabType } from "./types";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { user, setUser, isLoading, avatarTimestamp, updateAvatarCache } = useUser();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Sidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          avatarTimestamp={avatarTimestamp}
        />

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'skin' && <SkinTab user={user} onSkinUpdated={updateAvatarCache} />}
          {activeTab === 'settings' && <SettingsTab user={user} onUserUpdated={setUser} />}
        </div>
      </div>
    </div>
  );
}
