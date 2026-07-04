"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Settings, LogOut, Shield, Clock, Upload, User, Key, Save, Shirt, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import SkinViewer from "@/components/SkinViewer";
import { changeUsername, changePassword, uploadSkin, getUserProfile, UserResponse } from "@/client";
import { client } from "@/client/client.gen";
import { useRouter } from "next/router";
import { getFastApiError } from "@/lib/utils";
import 'lib/api-client';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'skin'>('overview');

  const [user, setUser] = useState<UserResponse>()

  useEffect(() => {
    async function loadUser() {
    const { data, error } = await getUserProfile();
    if (error || !data) {
      console.error(getFastApiError(error))
      const router = useRouter()
      router.push("/login")
      router.reload()
    }
      setUser(data)
      setUsername(data?.username)
    }

    loadUser()

  }, []);


  // Username
  const [username, setUsername] = useState(user?.username);
  const [newUsername, setNewUsername] = useState("Username");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const handleSaveUsername = async () => {
    if (newUsername === username) return;
    setIsSavingUsername(true);
    setUsernameError("");
    setUsernameSuccess(false);
    try {
      const { data } = await changeUsername({ query: { username: newUsername }, throwOnError: true });
      setUsername((data as any)?.username ?? newUsername);
      setUsernameSuccess(true);
      setTimeout(() => setUsernameSuccess(false), 3000);
    } catch (e: any) {
      setUsernameError(e.message || String(e));
    } finally {
      setIsSavingUsername(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) return;
    setIsSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      await changePassword({ body: { old_password: currentPassword, new_password: newPassword, confirm_password: newPassword }, throwOnError: true });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (e: any) {
      setPasswordError(e.message || String(e));
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Skin
  const [skinUrl, setSkinUrl] = useState("/api/v1/skin?name=" + user.username);
  const [previewSkinUrl, setPreviewSkinUrl] = useState<string | null>(null);
  const [skinError, setSkinError] = useState("");
  const [skinSuccess, setSkinSuccess] = useState(false);
  const [isSavingSkin, setIsSavingSkin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mojangNickname, setMojangNickname] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleSkinFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "image/png") {
        setSkinError("Требуется формат PNG");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewSkinUrl(e.target?.result as string);
        setSkinError("");
        setSkinSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSkin = async () => {
    if (!previewSkinUrl) return;
    setIsSavingSkin(true);
    setSkinError("");
    setSkinSuccess(false);
    try {
      const blob = await (await fetch(previewSkinUrl as string)).blob();
      await uploadSkin({ body: { file: blob }, throwOnError: true });
      setSkinUrl(previewSkinUrl);
      setPreviewSkinUrl(null);
      setSkinSuccess(true);
      setTimeout(() => setSkinSuccess(false), 3000);
    } catch (e: any) {
      setSkinError(e.message || String(e));
    } finally {
      setIsSavingSkin(false);
    }
  };

  const handleImportMojang = async () => {
    if (!mojangNickname) return;
    setIsImporting(true);
    setSkinError("");
    setSkinSuccess(false);
    try {
      const url = `https://minotar.net/skin/${mojangNickname}`;
      setPreviewSkinUrl(url);
    } catch (e: any) {
      setSkinError(e.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar / User Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 text-center shadow-xl">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl group-hover:bg-green-500/30 transition-colors"></div>
              <Image 
                src={"/api/v1/skin/avatar?name=" + username}
                alt="Player Skin" 
                width={128} 
                height={128} 
                className="relative rounded-2xl border-2 border-zinc-800 transition-colors rendering-pixelated"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-1">{username}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
              <Shield className="w-3 h-3" /> ИГРОК
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-4 shadow-xl">
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-green-500/10 text-green-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'}`}
              >
                <User className="w-5 h-5" />
                Обзор
              </button>
              <button 
                onClick={() => setActiveTab('skin')}
                className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors ${activeTab === 'skin' ? 'bg-green-500/10 text-green-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'}`}
              >
                <Shirt className="w-5 h-5" />
                Скин
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-green-500/10 text-green-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'}`}
              >
                <Settings className="w-5 h-5" />
                Настройки
              </button>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors mt-4">
                <LogOut className="w-5 h-5" />
                Выйти
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'overview' && (
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
          )}

          {activeTab === 'skin' && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <Shirt className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-bold text-white">Управление скином</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center lg:items-start">
                
                <div className="flex justify-center w-full">
                  <div className="w-full max-w-[340px] aspect-[3/4] bg-[#111112] rounded-3xl border border-zinc-800/60 p-4 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
                    <SkinViewer skinUrl={previewSkinUrl || skinUrl} username={username} />
                  </div>
                </div>

                {/* Controls Area */}
                <div className="space-y-6 w-full">
                  {skinError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm max-w-full">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {skinError}
                    </div>
                  )}
                  {skinSuccess && (
                     <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2 text-sm max-w-full">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Скин успешно обновлен!
                     </div>
                  )}
                  
                  <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 hover:border-zinc-700/80 transition-colors">
                    <h4 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Upload className="w-4 h-4 text-zinc-500" /> Загрузить файл
                    </h4>
                    <input 
                      type="file" 
                      accept="image/png"
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleSkinFileChange} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-colors border border-zinc-700 active:scale-95"
                    >
                      <Upload className="w-5 h-5" /> Выбрать PNG файл
                    </button>
                    {previewSkinUrl && (
                      <button 
                        onClick={handleSaveSkin}
                        disabled={isSavingSkin}
                        className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-green-900/20 active:scale-95"
                      >
                        {isSavingSkin ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Установить скин
                      </button>
                    )}
                    <p className="mt-4 text-xs text-zinc-500 text-center leading-relaxed">
                      Поддерживаются скины (64x32) и с плащами (64x64).
                    </p>
                  </div>

                  <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 hover:border-zinc-700/80 transition-colors">
                    <h4 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Download className="w-4 h-4 text-zinc-500" /> Импорт скина Mojang
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text"
                        value={mojangNickname}
                        onChange={(e) => setMojangNickname(e.target.value)}
                        placeholder="Никнейм лицензии" 
                        className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all shadow-inner" 
                      />
                      <button 
                        onClick={handleImportMojang}
                        disabled={isImporting || !mojangNickname}
                        className="flex items-center justify-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors border border-zinc-700 active:scale-95 whitespace-nowrap"
                      >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Импорт'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
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
                      disabled={isSavingUsername || newUsername === username}
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
          )}
        </div>
        
      </div>
    </div>
  );
}
