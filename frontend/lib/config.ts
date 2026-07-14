export const CONFIG = {
  api: {
    // Базовый URL для браузерного SDK-клиента (lib/api-client.ts).
    // По умолчанию пустой => запросы идут same-origin ("/api/..."), поэтому
    // HttpOnly-кука ходит корректно, а Next.js rewrite проксирует их на бэкенд.
    // В проде оставляем пустым (или ставим публичный origin сайта).
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    // Только для сервера: куда Next.js rewrite и серверные компоненты
    // (lib/api-server.ts) форвардят "/api/*". В докере — http://floppa-backend:8000.
    internalUrl: process.env.INTERNAL_API_URL || 'http://localhost:8000',
  },
  launcher: {
    exe: 'https://launcher.fl.2bd.net/FloppaLauncher.exe',
    jar: 'https://launcher.fl.2bd.net/FloppaLauncher.jar',
    appimage: 'https://launcher.fl.2bd.net/FloppaLauncher.AppImage',
  },
  discord: {
    serverId: '959163119517716511',
  }
};
