"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DownloadCloud, LayoutGrid, Clock, Box, HardDrive, Map, Server, Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { client } from "@/client/client.gen";

export default function ArchivePage() {
  const [servers, setServers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const { data } = await client.get({ url: '/api/v1/archive', throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
        setServers(data as any[]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchive();
  }, []);

  return (
    <div className="min-h-screen bg-[#070708] pt-6 pb-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> На главную
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-900/20">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2">Архив серверов</h1>
              <p className="text-zinc-400 text-lg">История наших прошлых сезонов и сборок</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {servers.length === 0 ? (
               <div className="text-center p-12 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
                 <p className="text-zinc-500">Архив пуст</p>
               </div>
            ) : (
              servers.map(server => (
                <div key={server.id} className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 shadow-2xl overflow-hidden hover:border-zinc-700/80 transition-all flex flex-col md:flex-row group">
                  {/* Screenshots Area */}
                  {server.screenshots && server.screenshots.length > 0 && (
                    <div className="md:w-2/5 p-4 md:p-6 md:pr-0">
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/50 border border-zinc-800">
                        <Image 
                          src={server.screenshots[0]} 
                          alt={server.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto snap-x hide-scrollbar">
                           {server.screenshots.slice(1).map((shot: string, i: number) => (
                             <div key={i} className="relative w-16 h-10 rounded-lg overflow-hidden border border-white/20 snap-start flex-shrink-0 cursor-pointer hover:border-white/60 transition-colors">
                               <Image src={shot} alt="screenshot" fill className="object-cover" />
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info Area */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white font-display mb-2 group-hover:text-blue-400 transition-colors">{server.name}</h2>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold font-mono border border-zinc-700">
                             {server.version}
                          </span>
                          <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-blue-500/20">
                            <Box className="w-3 h-3" /> {server.modLoader}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-zinc-400 leading-relaxed max-w-3xl mb-8 flex-1">
                      {server.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2 mb-4">
                        <HardDrive className="w-4 h-4 text-zinc-500" /> Файлы для скачивания
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {server.files?.map((file: any) => (
                          <a key={file.id} href={file.url} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 hover:bg-zinc-800 hover:border-blue-500/50 transition-all group/file">
                             <div className="flex items-center gap-3">
                               <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 group-hover/file:bg-blue-500/10 transition-colors">
                                 {file.type === 'world' ? <Map className="w-5 h-5 text-zinc-400 group-hover/file:text-blue-400" /> : <Box className="w-5 h-5 text-zinc-400 group-hover/file:text-blue-400" />}
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-zinc-200 group-hover/file:text-white transition-colors">{file.name}</p>
                                 <p className="text-xs text-zinc-500">{file.size}</p>
                               </div>
                             </div>
                             <DownloadCloud className="w-5 h-5 text-zinc-600 group-hover/file:text-blue-500 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
