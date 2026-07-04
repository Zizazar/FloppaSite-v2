"use client";

import { useState } from "react";
import { Settings, User, Key, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { UserResponse } from "@/client";
import { useChangeUsername, useChangePassword } from "@/hooks/use-api";
import { getFastApiError } from "@/lib/utils";

interface SettingsTabProps {
  user: UserResponse;
  onUserUpdated: (user: UserResponse) => void;
}

export default function SettingsTab({ user, onUserUpdated }: SettingsTabProps) {
  // Username
  const [newUsername, setNewUsername] = useState(user.username);
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const { mutateAsync: changeUsernameMut, isPending: isSavingUsername } = useChangeUsername();

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const { mutateAsync: changePasswordMut, isPending: isSavingPassword } = useChangePassword();

  const handleSaveUsername = async () => {
    if (newUsername === user.username) return;
    setUsernameError("");
    setUsernameSuccess(false);
    try {
      await changeUsernameMut(newUsername);
      onUserUpdated({ ...user, username: newUsername });
      setUsernameSuccess(true);
      setTimeout(() => setUsernameSuccess(false), 3000);
    } catch (e) {
      setUsernameError(getFastApiError(e));
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) return;
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      await changePasswordMut({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (e) {
      setPasswordError(getFastApiError(e));
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <Settings className="w-6 h-6 text-green-500" />
        <h3 className="text-xl font-bold text-white">Настройки аккаунта</h3>
      </div>

      <div className="space-y-8">
        {/* Никнейм */}
        <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 max-w-md">
          <h4 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-500" /> Смена никнейма
          </h4>

          {usernameError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {usernameError}
            </div>
          )}
          {usernameSuccess && (
            <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Имя обновлено!
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Новый никнейм"
              className="block w-full px-4 py-3.5 border border-zinc-800 rounded-xl bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all shadow-inner"
            />
            <button
              onClick={handleSaveUsername}
              disabled={isSavingUsername || newUsername === user.username}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors border border-zinc-700"
            >
              {isSavingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-green-500" />}
              Сохранить ник
            </button>
          </div>
        </div>

        {/* Пароль */}
        <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 max-w-md">
          <h4 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-zinc-500" /> Смена пароля
          </h4>

          {passwordError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Пароль изменен!
            </div>
          )}

          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Текущий пароль"
              className="block w-full px-4 py-3.5 border border-zinc-800 rounded-xl bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all shadow-inner"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Новый пароль"
              className="block w-full px-4 py-3.5 border border-zinc-800 rounded-xl bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all shadow-inner"
            />
            <button
              onClick={handleSavePassword}
              disabled={isSavingPassword || !currentPassword || !newPassword}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors border border-zinc-700"
            >
              {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Обновить пароль
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
