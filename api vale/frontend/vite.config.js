import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 4200,
    // Proxy: redirige las llamadas /api/v1/... al backend NestJS en puerto 3000
    // Esto evita problemas de CORS en desarrollo sin exponer la URL del backend en el código
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Sin rewrite: /api/v1/auth/login → http://localhost:3000/api/v1/auth/login
      },
    },
  },
})
