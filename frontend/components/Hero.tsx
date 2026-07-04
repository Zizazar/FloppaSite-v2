"use client";

import Image from "next/image";
import { Download, Terminal, Settings, Mic, Box, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import mainLogo from "@/assets/FloppaLandLogo.png";
import bgImage from "@/assets/bg.png";
import ModloaderIcon from "./ModloaderIcon";
import { CONFIG } from "@/lib/config";

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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-8">
            <a 
              href={CONFIG.launcher.exe}
              className="group relative w-full sm:w-auto overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-transform hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#4ade80_0%,#059669_50%,#4ade80_100%)] opacity-70" />
              <div className="inline-flex h-full w-full items-center justify-center gap-3 rounded-full bg-zinc-950/90 px-8 py-4 text-sm font-bold text-white transition-all duration-300 md:text-lg backdrop-blur-md">
                <Download className="w-6 h-6 text-green-500" />
                Скачать Лаунчер (EXE)
              </div>
            </a>
            
            <a 
              href={CONFIG.launcher.jar}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm transition-all duration-300 md:text-lg border border-white/10 hover:border-white/20"
            >
              <Terminal className="w-5 h-5 opacity-70" />
              jar для Linux/MacOS
            </a>
          </div>
        </motion.div>

        {/* Feature Cards from Reference */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          id="features" 
          className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left"
        >
          <div className="bg-zinc-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-green-500/30 transition-colors group">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 border border-green-500/20 group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Свой лаунчер</h3>
          </div>
          
          <div className="bg-zinc-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-green-500/30 transition-colors group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Голосовой чат</h3>
          </div>
          
          <div className="bg-zinc-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-green-500/30 transition-colors group">
            <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4 border border-teal-500/20 group-hover:scale-110 transition-transform">
              <Box className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Кастомные предметы</h3>
          </div>
          
          <div className="bg-zinc-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-green-500/30 transition-colors group">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <ModloaderIcon name="NeoForge" className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Шлёпа!</h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
