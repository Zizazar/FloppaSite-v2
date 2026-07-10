"use client";

import Image from "next/image";
import { motion } from "motion/react";
import mainLogo from "@/assets/FloppaLandLogo.png";
import bgImage from "@/assets/bg.png";
import launcherImg from "@/assets/images/launcher.png";
import voiceChatImg from "@/assets/images/voice_chat.png";
import craftsImg from "@/assets/images/crafts.png";
import addonsImg from "@/assets/images/addons.png";
import { CONFIG } from "@/lib/config";

// Иконки платформ для кнопок скачивания лаунчера (inline SVG, т.к. в lucide-react нет брендовых иконок ОС).
function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3 5.5 10.4 4.5V11.4H3V5.5ZM11.3 4.4 21 3V11.3H11.3V4.4ZM3 12.4H10.4V19.4L3 18.4V12.4ZM11.3 12.4H21V20.9L11.3 19.6V12.4Z" />
    </svg>
  );
}

function LinuxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5c-1.7 0-3 1.6-3 3.6 0 1.1.3 1.9.3 2.8 0 .6-.2 1-.7 1.7-1 1.4-2.9 3.6-2.9 5.9 0 1.1.5 1.8 1.3 1.8.5 0 .8-.2 1.3-.2.4 0 .6.5 1.5.9.6.3 1.3.5 2.2.5s1.6-.2 2.2-.5c.9-.4 1.1-.9 1.5-.9.5 0 .8.2 1.3.2.8 0 1.3-.7 1.3-1.8 0-2.3-1.9-4.5-2.9-5.9-.5-.7-.7-1.1-.7-1.7 0-.9.3-1.7.3-2.8 0-2-1.3-3.6-3-3.6Zm-1.6 3.3c.3 0 .6.3.6.8s-.3.9-.6.9-.6-.4-.6-.9.3-.8.6-.8Zm3.2 0c.3 0 .6.3.6.8s-.3.9-.6.9-.6-.4-.6-.9.3-.8.6-.8ZM12 8.4c.6 0 1.1.5 1.1.9 0 .5-.5 1.3-1.1 1.3s-1.1-.8-1.1-1.3c0-.4.5-.9 1.1-.9Zm-2.6 8.4c.4-.3.9-.7 1.4-.7.3 0 .5.1.7.2.2-.1.4-.2.7-.2.5 0 1 .4 1.4.7-.5.5-1.2 1-2.1 1s-1.6-.5-2.1-1Z" />
    </svg>
  );
}

function SteamDeckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="6" width="20" height="13" rx="4" />
      <path d="M8 10v5M5.5 12.5h5" />
      <circle cx="15.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Карточки-фичи с превью-изображениями (assets/images).
const FEATURES = [
  { img: launcherImg, title: "Свой лаунчер" },
  { img: voiceChatImg, title: "Голосовой чат" },
  { img: craftsImg, title: "Сбалансированные крафты" },
  { img: addonsImg, title: "Различные аддоны" },
] as const;

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Background"
          fill
          priority
          className="object-cover blur-[6px] scale-110 brightness-[0.4]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950"></div>
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto mt-16 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="mb-8 w-full max-w-2xl px-4">
            <Image 
              src={mainLogo} 
              alt="FloppaLand Main Logo" 
              width={800} 
              height={300} 
              className="w-full h-auto drop-shadow-2xl"
              priority
            />
          </div>
          
          <p className="text-zinc-200 text-xl md:text-3xl font-medium mb-10 max-w-3xl mx-auto drop-shadow-md">
            Самый разнообразный технический магический сервер
          </p>

          <div className="flex flex-row items-center justify-center gap-4 w-full px-8">
            <a
              href={CONFIG.launcher.exe}
              title="Скачать для Windows"
              className="group relative shrink-0 overflow-hidden rounded-2xl p-[2px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-transform hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4ade80_0%,#059669_50%,#4ade80_100%)] opacity-70" />
              <div className="relative flex h-full w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950/90 px-5 py-4 text-sm font-bold text-white transition-all duration-300 md:text-base backdrop-blur-md whitespace-nowrap">
                <WindowsIcon className="w-5 h-5 text-green-500 shrink-0" />
                <span>Windows</span>
              </div>
            </a>

            <a
              href={CONFIG.launcher.jar}
              title="Скачать для Linux/MacOS"
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-4 text-sm font-bold text-white bg-white/5 hover:bg-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 md:text-base border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <LinuxIcon className="w-5 h-5 opacity-80 shrink-0" />
              <span>Linux</span>
            </a>

            <a
              href={CONFIG.launcher.appimage}
              title="Скачать для Steam Deck"
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-4 text-sm font-bold text-white bg-white/5 hover:bg-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 md:text-base border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <SteamDeckIcon className="w-5 h-5 opacity-80 shrink-0" />
              <span>Steam Deck</span>
            </a>
          </div>
        </motion.div>

        {/* Feature Cards from Reference */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          id="features"
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-zinc-900/60 backdrop-blur-md p-3 rounded-3xl border border-white/5 hover:border-green-500/30 transition-colors group overflow-hidden"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-950/50">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white text-center py-4 px-2">
                {feature.title}
              </h3>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
