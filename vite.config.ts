import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({ registerType: 'autoUpdate' })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // URL de votre backend Flask
        changeOrigin: true, // Change l'origine pour correspondre au backend
        secure: false, // Désactive la vérification SSL (utile pour le développement local)
      },
    },
  },
});
