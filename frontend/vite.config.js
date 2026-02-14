import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'https://project1-y363.onrender.com', // Update to Render Backend
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'https://project1-y363.onrender.com',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
