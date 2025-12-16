import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // REMOVA O BLOCO 'server' COMPLETO SE VOCÊ NÃO FOR MAIS USAR O AMBIENTE LOCAL
  // server: { 
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:3001',
  //       changeOrigin: true
  //     }
  //   }
  // }
})