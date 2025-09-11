import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
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
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Add API key to all proxied requests
              if (env.VITE_KLARA_API_KEY) {
                proxyReq.setHeader('X-API-Key', env.VITE_KLARA_API_KEY);
              }
            });
          }
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate React and React DOM into their own chunk
            react: ['react', 'react-dom'],
            // Separate Material-UI into its own chunk
            mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
            // Separate Material-UI icons
            'mui-icons': ['@mui/icons-material'],
            // Separate routing
            router: ['react-router-dom'],
            // Separate state management and HTTP client
            utils: ['zustand', 'axios']
          }
        }
      }
    }
  }
})
