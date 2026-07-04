import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ExternalLink, Plus, Check, Download, Trash2, Loader2, ArrowUpRight, Box } from 'lucide-react';

export type Mod = {
  id: string;
  name: string;
  url: string;
  version: string;
  icon?: string;
};

interface ModSelectorProps {
  selectedMods: Mod[];
  onChange: (mods: Mod[]) => void;
}

export default function ModSelector({ selectedMods, onChange }: ModSelectorProps) {
  // Left Panel State
  const [selectedSearch, setSelectedSearch] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  // Right Panel State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [provider, setProvider] = useState<'modrinth' | 'curseforge'>('modrinth');
  
  const observerTarget = useRef(null);

  const filteredSelected = selectedMods.filter(mod => 
    mod.name.toLowerCase().includes(selectedSearch.toLowerCase())
  );

  // Search Modrinth API
  const searchMods = useCallback(async (query: string, currentOffset: number, append: boolean = false) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    if (provider === 'curseforge') {
      // CF API requires a key, so we stub it for this demo
      if (!append) {
        setSearchResults([]);
        setHasMore(false);
      }
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=20&offset=${currentOffset}`);
      const data = await res.json();
      
      const newResults = data.hits.map((hit: any) => ({
        id: hit.project_id,
        name: hit.title,
        url: `https://modrinth.com/mod/${hit.project_id}`,
        version: "latest", // Modrinth search doesn't return specific version directly here
        icon: hit.icon_url
      }));

      setSearchResults(prev => append ? [...prev, ...newResults] : newResults);
      setHasMore(newResults.length === 20);
      setOffset(currentOffset + 20);
    } catch (e) {
      console.error("Поиск не удался", e);
    } finally {
      setIsSearching(false);
    }
  }, [provider]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setOffset(0);
      searchMods(searchQuery, 0, false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, provider, searchMods]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isSearching && searchQuery) {
          searchMods(searchQuery, offset, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, hasMore, isSearching, searchQuery, offset, searchMods]);

  const handleAddMod = (mod: any) => {
    if (!selectedMods.find(m => m.id === mod.id || m.url === mod.url)) {
      onChange([...selectedMods, mod]);
    }
  };

  const handleRemoveMod = (modToRemove: Mod) => {
    onChange(selectedMods.filter(mod => mod !== modToRemove));
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) throw new Error("Ожидается массив");
      
      const importedMods: Mod[] = parsed.map(item => ({
        id: item.url || item.name,
        name: item.name || "Unknown",
        url: item.url || "#",
        version: item.version || "latest"
      }));

      // Merge avoiding duplicates by URL
      const newMods = [...selectedMods];
      importedMods.forEach(im => {
        if (!newMods.some(m => m.url === im.url)) {
          newMods.push(im);
        }
      });
      
      onChange(newMods);
      setIsImportOpen(false);
      setImportText('');
      setImportError('');
    } catch (e) {
      setImportError("Неверный формат JSON");
    }
  };

  return (
    <div className="bg-[#111112] rounded-3xl border border-zinc-800/80 p-6 flex flex-col lg:flex-row gap-6 h-[600px]">
      
      {/* Left Panel: Selected Mods */}
      <div className="flex-1 border border-zinc-800/60 rounded-2xl bg-zinc-950/30 flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-zinc-800/60">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-zinc-300 font-medium text-sm">Выбрано {selectedMods.length}</h4>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="поиск..." 
              value={selectedSearch}
              onChange={(e) => setSelectedSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-full">
          {filteredSelected.length === 0 ? (
             <div className="h-full flex items-center justify-center text-zinc-600 text-sm">Пусто</div>
          ) : (
            filteredSelected.map(mod => (
              <div key={mod.id + mod.url} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 group transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center flex-shrink-0 border border-zinc-800">
                    {mod.icon ? <img src={mod.icon} alt="" className="w-6 h-6 rounded-sm" /> : <Box className="w-4 h-4 text-zinc-500" />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-zinc-200 truncate">{mod.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{mod.version}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveMod(mod)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/80">
          <button 
            onClick={() => setIsImportOpen(true)}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Import
          </button>
        </div>

        {/* Import Overlay */}
        {isImportOpen && (
          <div className="absolute inset-0 bg-zinc-950/95 z-10 flex flex-col p-4 backdrop-blur-sm">
            <h4 className="text-white font-medium mb-2 text-sm flex items-center justify-between">
              Импорт JSON
              <button onClick={() => setIsImportOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </h4>
            <textarea 
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 font-mono resize-none focus:outline-none focus:border-amber-500"
              placeholder={'[\n  {\n    "name": "Sodium",\n    "url": "https://modrinth.com/mod/sodium",\n    "version": "mc1.20.1-0.5.3"\n  }\n]'}
            />
            {importError && <p className="text-red-400 text-xs mt-2">{importError}</p>}
            <button 
              onClick={handleImport}
              className="mt-3 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-lg text-sm transition-colors"
            >
              Импортировать
            </button>
          </div>
        )}
      </div>

      {/* Right Panel: Search */}
      <div className="flex-1 border border-zinc-800/60 rounded-2xl bg-zinc-950/30 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-800/60">
           <div className="flex items-center justify-between mb-3">
            <h4 className="text-zinc-300 font-medium text-sm">Найти</h4>
          </div>
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="поиск..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            {/* Provider Toggles */}
            <div className="flex bg-zinc-900 rounded-lg border border-zinc-800 p-1">
               <button 
                onClick={() => setProvider('modrinth')}
                title="Modrinth"
                className={`p-1.5 rounded-md transition-colors ${provider === 'modrinth' ? 'bg-[#1bd96a]/20 text-[#1bd96a]' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.067 22A10.021 10.021 0 0 0 22 11.933H12.067V22zm-1.854 0V11.933H.28A10.021 10.021 0 0 0 10.213 22zm11.787-11.921H12.067V.146a10.022 10.022 0 0 0-11.787 9.933h11.787z" fillRule="evenodd"/>
                 </svg>
               </button>
               <button 
                onClick={() => setProvider('curseforge')}
                title="CurseForge (Demo)"
                className={`p-1.5 rounded-md transition-colors ${provider === 'curseforge' ? 'bg-[#f16436]/20 text-[#f16436]' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.5 5.5l-6 6V11l-3 3v2l-4.5 4.5c-1 1-2.5 1-3.5 0s-1-2.5 0-3.5L9 12.5h2l3-3h-.5l6-6c1-1 2.5-1 3.5 0s1 2.5 0 3.5z"/>
                 </svg>
               </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
          {provider === 'curseforge' && searchQuery ? (
             <div className="p-8 text-center text-sm text-zinc-500">Поиск в CurseForge отключен в демо-версии</div>
          ) : searchQuery && searchResults.length === 0 && !isSearching ? (
             <div className="p-8 text-center text-sm text-zinc-500">Ничего не найдено</div>
          ) : !searchQuery ? (
             <div className="p-8 text-center text-sm text-zinc-500">Введите название мода...</div>
          ) : null}

          {searchResults.map(mod => {
            const isSelected = selectedMods.some(m => m.id === mod.id);
            return (
              <div key={mod.id} className="flex items-center justify-between p-2 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    {mod.icon ? <img src={mod.icon} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <Box className="w-5 h-5 text-zinc-500" />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-zinc-200 truncate">{mod.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{mod.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a 
                    href={mod.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20"
                    title="Открыть страницу"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => handleAddMod(mod)}
                    disabled={isSelected}
                    className={`p-2 rounded-lg transition-colors border ${isSelected ? 'bg-green-500/10 text-green-500 border-green-500/20 opacity-50 cursor-not-allowed' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30'}`}
                    title={isSelected ? "Уже добавлено" : "Добавить"}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}

          {isSearching && (
            <div className="p-4 flex justify-center">
              <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
          )}
          
          {hasMore && !isSearching && searchResults.length > 0 && (
             <div ref={observerTarget} className="h-4 w-full opacity-0" />
          )}
        </div>
      </div>

    </div>
  );
}
