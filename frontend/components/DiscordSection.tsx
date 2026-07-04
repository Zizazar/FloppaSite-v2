import { CONFIG } from "@/lib/config";
import { MessageSquare, Newspaper, UsersRound } from "lucide-react";

export default function DiscordSection() {

  return (
    <section className="py-24 relative z-10 bg-zinc-950 border-t border-zinc-900/50 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#5865F2]/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid md:grid-cols-2 gap-8 items-center">

          <div className="space-y-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">Присоединяйся к Discord</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#5865F2]/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#5865F2]/40">
                  <UsersRound className="text-[#5865F2] text-lg font-bold" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Активное сообщество</h3>
                  <p className="text-zinc-400">Тысячи игроков уже ждут тебя на сервере</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#5865F2]/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#5865F2]/40">
                  <MessageSquare className="text-[#5865F2] text-lg font-bold" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Поддержка 24/7</h3>
                  <p className="text-zinc-400">Получай помощь от администрации в любое время</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#5865F2]/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#5865F2]/40">
                  <Newspaper className="text-[#5865F2] text-lg font-bold" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Новости и обновления</h3>
                  <p className="text-zinc-400">Будь в курсе последних новостей и изменений</p>
                </div>
              </div>
            </div>

            <a 
              href={`https://discord.gg/${CONFIG.discord.serverId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] rounded-xl transition-all duration-300 md:text-lg shadow-[0_0_30px_rgba(88,101,242,0.3)] hover:shadow-[0_0_40px_rgba(88,101,242,0.5)] transform hover:-translate-y-1"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              ПЕРЕЙТИ В DISCORD
            </a>
          </div>

          {/* Правая часть - Discord Widget */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 rounded-2xl border border-[#5865F2]/30 overflow-hidden shadow-[0_0_40px_rgba(88,101,242,0.1)] hover:shadow-[0_0_60px_rgba(88,101,242,0.15)] transition-shadow duration-300 backdrop-blur-sm">
              {/* Фон для iframe */}
              <div className="aspect-[350/500] bg-zinc-900/30 flex items-center justify-center overflow-hidden">
                  <iframe
                    src={`https://discord.com/widget?id=${CONFIG.discord.serverId}&theme=dark`}
                    width="100%"
                    height="100%"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    className="rounded-xl"
                  ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
