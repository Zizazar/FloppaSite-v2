"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, User, Key, Mail, AlertCircle, Loader2 } from "lucide-react";
import { register as apiRegister, register } from "@/client";
import { client } from "@/client/client.gen";
import Image from "next/image";
import mainLogo from "@/assets/FloppaLandLogo.png";
import { getFastApiError } from "@/lib/utils";


export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !passwordConfirm) return;
    
    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    const { error } = await register({ 
            body: { username, password }
          });
    if (error) {
      setError(getFastApiError(error)); 
    } else {
      router.push("/profile");
      router.refresh()
    }
    setIsLoading(false);

  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800/80 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className=" flex items-center justify-center mx-auto mb-6 w-full max-w-xs">
            <Image
              src={mainLogo} 
              alt="FloppaLand Main Logo" 
              width={400} 
              height={150} 
              className="w-full h-auto drop-shadow-2xl animate-bounce"
              priority
            />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Регистрация</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Логин (Никнейм)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                placeholder="Steve"
                required
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">Этот ник будет использоваться в игре.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Пароль</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Повторите пароль</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password || !passwordConfirm}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-green-500 transition-colors mt-6"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Создать аккаунт
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-semibold text-green-500 hover:text-green-400 transition-colors">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
