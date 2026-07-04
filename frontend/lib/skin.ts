// Хелперы для построения URL скинов/аватаров.
// Эти адреса используются как src для <img>/next-image и SkinViewer,
// поэтому это просто строки, а не вызовы SDK. Запросы идут на /api/*,
// который next.config.ts проксирует на бэкенд (куки прикрепляются автоматически).

const SKIN_BASE = '/api/v1/skin';

/** Полный скин игрока (PNG 64x64 / 64x32). */
export function skinUrl(name?: string | null): string {
  return `${SKIN_BASE}/?name=${encodeURIComponent(name ?? '')}`;
}

/**
 * Аватар (голова) игрока.
 * @param cacheBust необязательный timestamp — меняется после загрузки нового
 *                  скина, чтобы браузер/next-image скачали свежую картинку.
 */
export function avatarUrl(name?: string | null, cacheBust?: number): string {
  const base = `${SKIN_BASE}/avatar?name=${encodeURIComponent(name ?? '')}`;
  return cacheBust ? `${base}&t=${cacheBust}` : base;
}
