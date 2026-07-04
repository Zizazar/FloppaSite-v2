import { client } from '@/client/client.gen';
import { cookies } from 'next/headers';

let interceptorRegistered = false;

// Настраивает общий hey-api клиент для серверных компонентов:
// проксирует запросы на бэкенд и прикрепляет куки входящего запроса.
export function setupServerApiClient() {
  client.setConfig({
    baseUrl: process.env.BACKEND_URL || 'http://localhost:8000',
  });

  // Регистрируем перехватчик один раз — иначе они накапливаются на каждый вызов.
  if (interceptorRegistered) return;
  interceptorRegistered = true;

  client.interceptors.request.use(async (request) => {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    if (cookieString) {
      request.headers.set('Cookie', cookieString);
    }
  });
}
