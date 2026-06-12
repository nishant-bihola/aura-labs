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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            const path = id.replace(/\\/g, '/');
            const pkg = (name: string) => path.includes(`node_modules/${name}/`);
            // WebGL stack — referenced only by the lazy hero scene, so
            // splitting it keeps ~1MB of three.js off the first paint.
            // Everything else stays in one 'vendor' chunk: the previous
            // substring-based react/framer split produced circular
            // chunks (see old build warnings) which could break module
            // evaluation order at runtime.
            if (
              pkg('three') ||
              pkg('three-stdlib') ||
              pkg('three-mesh-bvh') ||
              pkg('postprocessing') ||
              pkg('maath') ||
              pkg('detect-gpu') ||
              path.includes('node_modules/@react-three/') ||
              path.includes('node_modules/@monogrid/') ||
              path.includes('node_modules/troika-')
            ) {
              return 'vendor-three';
            }
            return 'vendor';
          }
        }
      }
    }
  };
});
