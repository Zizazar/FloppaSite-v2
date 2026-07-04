"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { listUsers } from "@/client";

export default function UsersTab() {
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
          setUsers((data as any) ?? []);
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

  // Локальное переключение статуса (бан/разбан). Бэкенд-эндпоинт ещё не готов.
  const toggleStatus = (user: any) => {
    setUsers(users.map((u) => (u.id === user.id ? { ...u, is_active: !(u.is_active ?? true) } : u)));
  };

  const statusOf = (user: any) => (user.is_active === false ? 'Banned' : 'Active');
  const isAdmin = (user: any) => String(user.role).toLowerCase() === 'admin';

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
              users.map((user) => {
                const status = statusOf(user);
                return (
                  <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4 text-sm text-zinc-500 font-mono">{user.id}</td>
                    <td className="p-4 text-sm font-bold text-white">{user.username}</td>
                    <td className="p-4 text-sm text-zinc-400">{user.email ?? '—'}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${isAdmin(user) ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-zinc-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-400 font-mono">{user.created_at ?? '—'}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleStatus(user)}
                        className="text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors border border-zinc-700"
                      >
                        {status === 'Active' ? 'Бан' : 'Разбан'}
                      </button>
                    </td>
                  </tr>
                );
              })
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors border border-zinc-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            disabled={page === totalPages || isLoading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors border border-zinc-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
