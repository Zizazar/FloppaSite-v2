export const CONFIG = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    backend: process.env.BACKEND_API_URL
  },
  launcher: {
    exe: 'https://fllauncher.zizazr.art/FloppaLauncher.exe',
    jar: 'https://fllauncher.zizazr.art/FloppaLauncher.jar',
  },
  discord: {
    serverId: '959163119517716511',
  }
};