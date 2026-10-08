import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    // GitHub Pages için repository yolu
    base: '/K.O.R-Fire-Network/',

    plugins: [
      react(),
      tailwindcss(),

      VitePWA({
        registerType: 'autoUpdate',

        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
        ],

        manifest: {
          id: '/K.O.R-Fire-Network/',
          name: 'Yaşam & Finans Asistanı',
          short_name: 'Yaşam&Finans',

          description:
            'Sıfır maliyetli, çevrimdışı ve gizlilik odaklı PWA gündelik yaşam ve kişisel bütçe asistanı.',

          theme_color: '#090d16',
          background_color: '#090d16',

          display: 'standalone',

          start_url: '/K.O.R-Fire-Network/',
          scope: '/K.O.R-Fire-Network/',

          icons: [
            {
              src: '/K.O.R-Fire-Network/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/K.O.R-Fire-Network/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/K.O.R-Fire-Network/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },

        workbox: {
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,woff,woff2}',
          ],
        },

        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // Gemini AI Studio için HMR ayarı
      hmr: process.env.DISABLE_HMR !== 'true',

      // Agent düzenlemeleri sırasında dosya izlemeyi kapat
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {},
    },
  };
});
