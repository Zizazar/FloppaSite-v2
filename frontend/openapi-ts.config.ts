import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:8000/openapi.json',
  output: 'client',
  plugins: [
    '@hey-api/client-next',
    '@hey-api/sdk',
    {
      name: '@tanstack/react-query', // Auto-generate React Query hooks for all endpoints
    },
  ],
});