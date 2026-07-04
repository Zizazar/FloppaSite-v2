"use client";

import { useState } from "react";
import { Search, ExternalLink, Package } from "lucide-react";
import Image from "next/image";

const MOCK_MODS = [
  {
    id: 1,
    name: "Create",
    description: "Technology mod based on kinetic energy. Building machines has never been this fun.",
    icon: "https://picsum.photos/seed/create/64/64",
    modrinth: "https://modrinth.com/mod/create",
    curseforge: "https://www.curseforge.com/minecraft/mc-mods/create"
  },
  {
    id: 2,
    name: "Farmers Delight",
    description: "Expands farming and cooking in Minecraft with new crops, tools, and meals.",
    icon: "https://picsum.photos/seed/farmers/64/64",
    modrinth: "https://modrinth.com/mod/farmers-delight",
    curseforge: "https://www.curseforge.com/minecraft/mc-mods/farmers-delight"
  },
  {
    id: 3,
    name: "Jei (Just Enough Items)",
    description: "View items and recipes. An essential mod for any modpack.",
    icon: "https://picsum.photos/seed/jei/64/64",
    curseforge: "https://www.curseforge.com/minecraft/mc-mods/jei"
  },
  {
    id: 4,
    name: "Sophisticated Backpacks",
    description: "Adds variety of backpacks with different tiers and upgrade slots.",
    icon: "https://picsum.photos/seed/backpacks/64/64",
    curseforge: "https://www.curseforge.com/minecraft/mc-mods/sophisticated-backpacks"
  },
  {
    id: 5,
    name: "Macaw's Bridges",
    description: "Provides various types of bridges to decorate your world.",
    icon: "https://picsum.photos/seed/bridges/64/64",
    modrinth: "https://modrinth.com/mod/macaws-bridges",
  },
  {
    id: 6,
    name: "Sodium",
    description: "Modern rendering engine replacement that greatly improves frame rates.",
    icon: "https://picsum.photos/seed/sodium/64/64",
    modrinth: "https://modrinth.com/mod/sodium",
  }
];

export default function ModsList() {
  const [search, setSearch] = useState("");

  const filteredMods = MOCK_MODS.filter(mod => 
    mod.name.toLowerCase().includes(search.toLowerCase()) || 
    mod.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="mods" className="py-24 relative z-10 bg-zinc-950 border-t border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">Список модов</h2>
          <div className="w-24 h-1 bg-green-500 mx-auto rounded-full mb-8"></div>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg mb-8">
            Ознакомьтесь с модификациями, которые делают наш сервер уникальным.
          </p>

          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all shadow-inner"
              placeholder="Поиск по названию или описанию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMods.map((mod) => (
            <div key={mod.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 hover:border-green-500/30 transition-all group flex flex-col h-full">
              <div className="flex gap-4 items-start mb-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50 shrink-0">
                  <Image 
                    src={mod.icon} 
                    alt={mod.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-300" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-green-400 transition-colors">{mod.name}</h3>
                  <div className="flex gap-2">
                    {mod.modrinth && (
                      <a href={mod.modrinth} target="_blank" rel="noreferrer" className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 px-2 py-0.5 rounded transition-colors flex items-center gap-1">
                        Modrinth <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {mod.curseforge && (
                      <a href={mod.curseforge} target="_blank" rel="noreferrer" className="text-xs font-semibold bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-zinc-950 px-2 py-0.5 rounded transition-colors flex items-center gap-1">
                        CurseForge <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-zinc-400 flex-grow leading-relaxed">
                {mod.description}
              </p>
            </div>
          ))}
          
          {filteredMods.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white">Моды не найдены</h3>
              <p className="text-zinc-500 mt-1">Попробуйте изменить запрос поиска</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
