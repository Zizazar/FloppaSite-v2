"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Users, 
  Server, 
  TrendingUp, 
  DownloadCloud, 
  Activity, 
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Archive,
  Plus,
  Trash2,
  Edit2
} from "lucide-react";
import { client } from "@/client/client.gen";
import ModSelector, { Mod } from "@/components/ModSelector";
import { listUsers } from "@/client";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'server' | 'archive'>('dashboard');

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
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-4 shadow-xl">
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent'}`}
              >
                <BarChart3 className="w-5 h-5" />
                Статистика
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors ${activeTab === 'users' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent'}`}
              >
                <Users className="w-5 h-5" />
                Пользователи
              </button>
              <button 
                onClick={() => setActiveTab('server')}
                className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors ${activeTab === 'server' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent'}`}
              >
                <Server className="w-5 h-5" />
                Мониторинг
              </button>
              <button 
                onClick={() => setActiveTab('archive')}
                className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors ${activeTab === 'archive' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent'}`}
              >
                <Archive className="w-5 h-5" />
                Архивы
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'server' && <AdminServer />}
          {activeTab === 'archive' && <AdminArchive />}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Dashboard Tab
// ----------------------------------------------------------------------
function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await client.get({ url: '/api/v1/admin/stats', throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
        setStats(data as any);
      } catch (err) {
        console.error("Ошибка загрузки статистики", err);
      }
    };

    fetchStats();
    // Update every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-12 shadow-xl flex justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Realtime Stats */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mt-10 -mr-10 transition-colors group-hover:bg-green-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1 line-clamp-1">Игроков онлайн</p>
              <h3 className="text-3xl font-bold text-white font-mono">{stats.onlinePlayers}</h3>
            </div>
            <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-md w-max border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            В реальном времени
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mt-10 -mr-10 transition-colors group-hover:bg-blue-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1 line-clamp-1">На сайте сейчас</p>
              <h3 className="text-3xl font-bold text-white font-mono">{stats.websiteUsersNow}</h3>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md w-max border border-blue-500/20">
             Обновлено только что
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mt-10 -mr-10 transition-colors group-hover:bg-purple-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1 line-clamp-1">Скачиваний лаунчера</p>
              <h3 className="text-3xl font-bold text-white font-mono">{stats.launcherDownloads.toLocaleString()}</h3>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
              <DownloadCloud className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-400">
            <TrendingUp className="w-3 h-3" /> +12 за сегодня
          </div>
        </div>
        
        {/* Secondary Stats */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Посещения (Сегодня)</p>
              <h3 className="text-2xl font-bold text-white font-mono">{stats.websiteUsersDaily}</h3>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Посещения (Месяц)</p>
              <h3 className="text-2xl font-bold text-white font-mono">{stats.websiteUsersMonthly.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Всего регистраций</p>
              <h3 className="text-2xl font-bold text-white font-mono">{stats.totalRegistered.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Users Tab
// ----------------------------------------------------------------------
function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
        const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data } = await listUsers();
        if ((data as any)?.users) {
          setUsers((data as any).users);
          setTotalPages((data as any).totalPages ?? 1);
        } else {
          setUsers(data as any);
          setTotalPages(1);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [page]);

  const toggleStatus = async (user: any) => {
    const newStatus = user.status === 'Active' ? 'Banned' : 'Active';
    try {
       setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch {
       // handle error
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl shadow-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Управление пользователями</h3>
          <p className="text-zinc-400 text-sm">Список зарегистрированных аккаунтов</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/50 border-b border-zinc-800/50">
              <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">ID</th>
              <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Никнейм</th>
              <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</th>
              <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Роль</th>
              <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Дата рег.</th>
              <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Статус</th>
              <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 relative min-h-[400px]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4 text-sm text-zinc-500 font-mono">{user.id}</td>
                  <td className="p-4 text-sm font-bold text-white">{user.username}</td>
                  <td className="p-4 text-sm text-zinc-400">{user.email}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${user.role === 'Admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-zinc-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-zinc-400 font-mono">{user.id}</td>
                  <td className="p-4 text-sm">
                     <span className={`px-2 py-1 rounded-md text-xs font-semibold ${user.username === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                      {user.username}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => toggleStatus(user)}
                      className="text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors border border-zinc-700"
                    >
                      {user.username === 'Active' ? 'Бан' : 'Разбан'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-zinc-800/80 flex items-center justify-between bg-zinc-950/30">
        <p className="text-zinc-500 text-sm">
          Страница <span className="font-bold text-zinc-300">{page}</span> из <span className="font-bold text-zinc-300">{totalPages}</span>
        </p>
        <div className="flex gap-2">
          <button 
            disabled={page === 1 || isLoading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors border border-zinc-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            disabled={page === totalPages || isLoading}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors border border-zinc-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Server Config Tab
// ----------------------------------------------------------------------
function AdminServer() {
  const [config, setConfig] = useState({
    ip: "", name: "", description: "", version: "", launchDate: "", modLoader: "", mods: [] as Mod[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await client.get({ url: '/api/v1/admin/server', throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
        setConfig(data as any);
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
              onChange={(e) => setConfig({...config, name: e.target.value})}
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">IP Адрес</label>
            <input 
              type="text" 
              value={config.ip}
              onChange={(e) => setConfig({...config, ip: e.target.value})}
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Версия игры</label>
            <input 
              type="text" 
              value={config.version}
              onChange={(e) => setConfig({...config, version: e.target.value})}
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Загрузчик модов</label>
            <select 
              value={config.modLoader}
              onChange={(e) => setConfig({...config, modLoader: e.target.value})}
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
              onChange={(e) => setConfig({...config, description: e.target.value})}
              rows={3}
              className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-300 mb-2">Дата последнего вайпа</label>
            <input 
              type="date" 
              value={config.launchDate}
              onChange={(e) => setConfig({...config, launchDate: e.target.value})}
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

// ----------------------------------------------------------------------
// 4. ARCHIVE TAB
// ----------------------------------------------------------------------
function AdminArchive() {
  const [archives, setArchives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    setIsLoading(true);
    const { data } = await client.get({ url: '/api/v1/archive', throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
    setArchives(data as any[]);
    setIsLoading(false);
  };

  const handleEdit = (archive: any) => {
    setFormData({ ...archive, screenshots: archive.screenshots?.join('\n') || '' });
    setEditingId(archive.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Удалить архив?")) {
      await client.delete({ url: `/api/v1/admin/archive/${id}`, throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
      loadArchives();
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "", version: "", modLoader: "Fabric", description: "",
      files: [], screenshots: ""
    });
    setEditingId(-1); // -1 means new
  };

  const handleSave = async () => {
    const dataToSave = {
      ...formData,
      screenshots: typeof formData.screenshots === 'string' 
        ? formData.screenshots.split('\n').filter(Boolean) 
        : formData.screenshots
    };

    if (editingId === -1) {
      await client.post({ url: '/api/v1/admin/archive', body: dataToSave, throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
    } else {
      await client.put({ url: `/api/v1/admin/archive/${editingId}`, body: dataToSave, throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
    }
    setEditingId(null);
    loadArchives();
  };

  const handleAddFile = () => {
    setFormData({
      ...formData,
      files: [...formData.files, { id: Date.now(), name: "Новый файл", type: "modpack", size: "0 MB", url: "" }]
    });
  };

  const removeFile = (fileId: number) => {
    setFormData({
      ...formData,
      files: formData.files.filter((f: any) => f.id !== fileId)
    });
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;
  }

  if (editingId !== null && formData) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white font-display">
            {editingId === -1 ? 'Новый архив' : 'Редактировать архив'}
          </h2>
          <button 
            onClick={() => setEditingId(null)}
            className="text-zinc-500 hover:text-white"
          >
            Отмена
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Название</label>
            <input 
              type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white" 
            />
          </div>
          <div>
             <label className="block text-sm font-bold text-zinc-300 mb-2">Версия</label>
             <input 
              type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})}
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white" 
            />
          </div>
          <div>
             <label className="block text-sm font-bold text-zinc-300 mb-2">Загрузчик модов</label>
             <input 
              type="text" value={formData.modLoader} onChange={e => setFormData({...formData, modLoader: e.target.value})}
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-300 mb-2">Описание</label>
            <textarea 
              rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white resize-none" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-300 mb-2">Скриншоты (каждый с новой строки)</label>
            <textarea 
              rows={3} value={formData.screenshots} onChange={e => setFormData({...formData, screenshots: e.target.value})}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white resize-none font-mono text-sm" 
            />
          </div>

          <div className="md:col-span-2 pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-4">
               <label className="block text-sm font-bold text-zinc-300">Файлы сервера</label>
               <button onClick={handleAddFile} className="text-sm text-blue-400 hover:text-blue-300 font-medium">+ Добавить файл</button>
            </div>
            <div className="space-y-3">
              {formData.files.map((file: any, index: number) => (
                <div key={file.id} className="flex gap-2 items-center bg-zinc-950/50 border border-zinc-800 p-3 rounded-xl flex-wrap group transition-colors focus-within:border-zinc-700">
                  <input type="text" placeholder="Название" value={file.name} onChange={e => {
                    const newFiles = [...formData.files];
                    newFiles[index].name = e.target.value;
                    setFormData({...formData, files: newFiles});
                  }} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm" />
                  
                  <select value={file.type} onChange={e => {
                     const newFiles = [...formData.files];
                     newFiles[index].type = e.target.value;
                     setFormData({...formData, files: newFiles});
                  }} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="modpack">Сборка</option>
                    <option value="world">Мир</option>
                  </select>

                  <input type="text" placeholder="Размер" value={file.size} onChange={e => {
                    const newFiles = [...formData.files];
                    newFiles[index].size = e.target.value;
                    setFormData({...formData, files: newFiles});
                  }} className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm" />

                  <input type="text" placeholder="URL" value={file.url} onChange={e => {
                    const newFiles = [...formData.files];
                    newFiles[index].url = e.target.value;
                    setFormData({...formData, files: newFiles});
                  }} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm font-mono mt-2" />
                  
                  <button onClick={() => removeFile(file.id)} className="w-full mt-2 p-2 bg-red-500/10 text-red-500 rounded-lg font-medium text-sm hover:bg-red-500 hover:text-white transition-colors">Удалить файл</button>
                </div>
              ))}
              {formData.files.length === 0 && <p className="text-zinc-500 text-sm italic">Нет прикрепленных файлов</p>}
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
           <button 
             onClick={handleSave}
             className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-900/20"
           >
             <Save className="w-4 h-4" /> Сохранить
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
          Управление архивами
          <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-md border border-red-500/20">{archives.length}</span>
        </h2>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-600 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Название</th>
                <th className="px-6 py-4 font-medium">Версия / Загрузчик</th>
                <th className="px-6 py-4 font-medium">Файлов</th>
                <th className="px-6 py-4 font-medium text-right shadow-[inset_1px_0_0_#27272a,inset_0_1px_0_#27272a]">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {archives.map(arch => (
                <tr key={arch.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{arch.name}</td>
                  <td className="px-6 py-4 text-zinc-400">
                    <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded text-xs">{arch.version}</span> {arch.modLoader}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{arch.files?.length || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleEdit(arch)}
                      className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors inline-block mr-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(arch.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {archives.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Нет добавленных архивов</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
