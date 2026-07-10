"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface DoomCaptchaProps {
  /** Вызывается, когда игрок убил 3 монстров (капча пройдена). */
  onSolved: () => void;
  /** Закрыть капчу без прохождения. */
  onClose: () => void;
}

/**
 * DOOM-капча: перед сменой скина пользователь должен убить трёх монстров.
 *
 * Сама игра (Emscripten-сборка DOOM) живёт в iframe (/doom/index.html), чтобы
 * её глобальные объекты (Module, canvas) и повторное подключение скриптов не
 * конфликтовали с React/StrictMode. Об успехе iframe сообщает через postMessage
 * ({ type: "doom-captcha-solved" }) — см. public/doom/doom_manager.js.
 */
export default function DoomCaptcha({ onSolved, onClose }: DoomCaptchaProps) {
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Принимаем сообщение только от нашего же origin (iframe того же сайта).
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "doom-captcha-solved") {
        onSolved();
      }
    };
    window.addEventListener("message", handleMessage);

    // Закрытие по Esc.
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onSolved, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative">
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute -top-3 -right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 shadow-lg transition-colors active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
        <iframe
          src="/doom/index.html"
          title="DOOM Captcha"
          scrolling="no"
          className="w-[440px] max-w-[calc(100vw-2rem)] h-[418px] border-0 bg-transparent"
        />
      </div>
    </div>
  );
}
