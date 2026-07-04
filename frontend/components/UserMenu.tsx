import Link from "next/link";
import { User, ShieldAlert, ChevronDown, LogOut, LogIn } from "lucide-react";
import { getUserProfile } from "@/client";
import Image from "next/image";
import { setupServerApiClient } from "@/lib/api-server";
import { cookies } from "next/headers";
import 'lib/api-client';
import { getFastApiError } from "@/lib/utils";

async function getUser() {
  try {
    // Настраиваем наш API-клиент (он прикрепит куки к запросу)
    setupServerApiClient();
    
    const { data, error, response } = await getUserProfile();
    if (error || !data) {
        console.error(getFastApiError(error))
        return null;
    }
    return data;
  } catch (e) {
    return null; // Если бэкенд упал или токен невалиден
  }
}

export default async function UserMenu() {

  const user = await getUser()


  return !user ? (
    <Link href="/login" className="text-zinc-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
        <LogIn className="w-4 h-4" />
            Войти
    </Link>
    ) : (
    <div className="relative group/user">
      <button className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 rounded-2xl pl-1.5 pr-3 py-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image 
            src={"/api/v1/skin/avatar?name=" + user.username}
            alt="Player Skin"
            width={32} 
            height={32} 
            className="relative rounded-2xl border-zinc-800 transition-colors rendering-pixelated"
            referrerPolicy="no-referrer"
            />
        <span className="text-sm font-bold">{user.username}</span>
        <ChevronDown className="w-4 h-4 text-zinc-500 group-hover/user:text-white transition-colors" />
      </button>
      
      <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 z-50">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden py-1">
          <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors">
            <User className="w-4 h-4" />
            Профиль
          </Link>
          <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-red-400 hover:bg-zinc-800/80 transition-colors">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            Админ-панель
          </Link>
          <div className="h-px bg-zinc-800 my-1"></div>
          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors">
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}