import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          // Strategy: only force-group libraries that are needed on EVERY page
          // (eager + cache-stable). Everything reached *only* through a dynamic
          // import — the Sanity Studio (/studio) and the 3D hero scene, plus
          // their huge transitive trees (hls.js, @codemirror, @mux, troika,
          // three-stdlib …) — is left to Rollup, which splits it into async
          // chunks that never touch first paint. A catch-all `return 'vendor'`
          // is what previously dragged ~3 MB of Studio code into the eager load.
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            // React core + router — shared by every route.
            if (
              id.includes('/react-dom/') ||
              id.includes('/react-router') ||
              id.includes('/node_modules/react/') ||
              id.includes('/scheduler/')
            ) {
              return 'react-vendor';
            }

            // Animation libraries — used across the landing page.
            if (
              id.includes('framer-motion') ||
              id.includes('/node_modules/motion/') ||
              id.includes('/gsap/')
            ) {
              return 'motion';
            }

            // Small, stable always-on utilities. Explicit allow-list keeps the
            // eager vendor chunk lean and cacheable without sweeping in
            // dynamic-only dependencies.
            if (
              id.includes('/lenis/') ||
              id.includes('/clsx/') ||
              id.includes('/tailwind-merge/') ||
              id.includes('lucide-react') ||
              id.includes('@calcom/') ||
              id.includes('@vercel/')
            ) {
              return 'vendor';
            }

            // Anything else (Studio + 3D ecosystems) → let Rollup auto-split it
            // along the dynamic-import boundary so it loads lazily.
            return undefined;
          }
        }
      }
    }
  };
});
