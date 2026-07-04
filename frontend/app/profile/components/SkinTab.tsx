"use client";

import { useRef, useState } from "react";
import { Shirt, Upload, Download, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import SkinViewer from "@/components/SkinViewer";
import type { UserResponse } from "@/client";
import { useUploadSkin } from "@/hooks/use-api";
import { getFastApiError } from "@/lib/utils";
import { skinUrl as buildSkinUrl } from "@/lib/skin";

interface SkinTabProps {
  user: UserResponse;
  onSkinUpdated?: () => void;
}

export default function SkinTab({ user, onSkinUpdated }: SkinTabProps) {
  const [skinUrl, setSkinUrl] = useState(() => buildSkinUrl(user.username));
  const [previewSkinUrl, setPreviewSkinUrl] = useState<string | null>(null);
  const [skinError, setSkinError] = useState("");
  const [skinSuccess, setSkinSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mojangNickname, setMojangNickname] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const { mutateAsync: uploadSkinMut, isPending: isSavingSkin } = useUploadSkin();

  const handleSkinFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "image/png") {
        setSkinError("Требуется формат PNG");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewSkinUrl(ev.target?.result as string);
        setSkinError("");
        setSkinSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSkin = async () => {
    if (!previewSkinUrl) return;
    setSkinError("");
    setSkinSuccess(false);
    try {
      const blob = await (await fetch(previewSkinUrl)).blob();
      await uploadSkinMut(blob);
      setSkinUrl(previewSkinUrl);
      setPreviewSkinUrl(null);
      setSkinSuccess(true);
      onSkinUpdated?.();
      setTimeout(() => setSkinSuccess(false), 3000);
    } catch (e) {
      setSkinError(getFastApiError(e));
    }
  };

  const handleImportMojang = () => {
    if (!mojangNickname) return;
    setIsImporting(true);
    setSkinError("");
    setSkinSuccess(false);
    try {
      setPreviewSkinUrl(`https://minotar.net/skin/${mojangNickname}`);
    } catch (e) {
      setSkinError(getFastApiError(e));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <Shirt className="w-6 h-6 text-green-500" />
        <h3 className="text-xl font-bold text-white">Управление скином</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center lg:items-start">

        <div className="flex justify-center w-full">
          <div className="w-full max-w-[340px] aspect-[3/4] bg-[#111112] rounded-3xl border border-zinc-800/60 p-4 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
            <SkinViewer skinUrl={previewSkinUrl || skinUrl} username={user.username} />
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
  );
}
