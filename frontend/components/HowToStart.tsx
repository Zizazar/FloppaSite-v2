import { CONFIG } from "@/lib/config";
import { UserPlus, DownloadCloud, Settings2, PlayCircle } from "lucide-react";

export default function HowToStart() {
  return (
    <section id="start" className="py-24 relative z-10 bg-zinc-950 border-t border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">Как начать играть?</h2>
          <div className="w-24 h-1 bg-green-500 mx-auto rounded-full mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line for lg screens */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0 z-0"></div>

          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-green-500/50 transition-colors shadow-lg">
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-500 text-zinc-950 font-bold flex items-center justify-center border-4 border-zinc-950">1</div>
              <UserPlus className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Регистрация</h3>
            <p className="text-zinc-400 text-sm mb-4">Создайте аккаунт для входа в лаунчер.</p>
            <a href="/register" className="text-green-500 hover:text-green-400 font-semibold text-sm transition-colors">Зарегистрироваться →</a>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-green-500/50 transition-colors shadow-lg">
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-500 text-zinc-950 font-bold flex items-center justify-center border-4 border-zinc-950">2</div>
              <DownloadCloud className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Скачайте лаунчер</h3>
            <p className="text-zinc-400 text-sm mb-4">Выберите версию для вашей операционной системы.</p>
            <a href={CONFIG.launcher.exe} className="text-green-500 hover:text-green-400 font-semibold text-sm transition-colors">Скачать для Windows →</a>
            <a href={CONFIG.launcher.jar} className="text-green-500 hover:text-green-400 font-semibold text-sm transition-colors mt-2">Скачать для Linux/MacOS →</a>
            <a href={CONFIG.launcher.appimage} className="text-green-500 hover:text-green-400 font-semibold text-sm transition-colors mt-2">Скачать для Steam Deck →</a>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-green-500/50 transition-colors shadow-lg">
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-500 text-zinc-950 font-bold flex items-center justify-center border-4 border-zinc-950">3</div>
              <Settings2 className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Настройте лаунчер</h3>
            <p className="text-zinc-400 text-sm">Войдите в лаунчер и выделите достаточно оперативной памяти.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-green-500/50 transition-colors shadow-lg">
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-500 text-zinc-950 font-bold flex items-center justify-center border-4 border-zinc-950">4</div>
              <PlayCircle className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Запуск!</h3>
            <p className="text-zinc-400 text-sm">Запустите игру и наслаждайтесь игрой на нашем сервере.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
