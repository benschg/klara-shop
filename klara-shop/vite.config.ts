import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://api.klara.ch',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: true,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add API key to all proxied requests
              if (env.VITE_KLARA_API_KEY) {
                proxyReq.setHeader('X-API-Key', env.VITE_KLARA_API_KEY);
                console.log('Adding API key to proxy request');
              } else {
                console.log('No API key found in environment');
              }
            });
          }
        }
      }
    }
  }
})
