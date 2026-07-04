import { client } from '@/client/client.gen';
import { cookies } from 'next/headers';

export function setupServerApiClient() {
  client.setConfig({
    baseUrl: process.env.BACKEND_URL || 'http://localhost:8000', 
  });
  

  client.interceptors.request.use( async (request) => {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    console.log(cookieString)

    if (cookieString) {
      request.headers.set('Cookie', cookieString);
    }

    return request;
  });
}