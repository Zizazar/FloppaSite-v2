
import { client } from '@/client/client.gen';
import { CONFIG } from './config';

client.setConfig({
  baseUrl: CONFIG.api.baseUrl,
  // attach HttpOnly cookie
  credentials: 'include', 
});

export { client };