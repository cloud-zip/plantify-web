import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/plantify-web/',
    build: {
      // Rolldown (Vite 8) uses manualChunks as a function, not an object
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three') ||
                id.includes('node_modules/@react-three')) {
              return 'vendor-three';
            }
            if (id.includes('node_modules/recharts') ||
                id.includes('node_modules/d3-') ||
                id.includes('node_modules/d3/')) {
              return 'vendor-charts';
            }
            if (id.includes('node_modules/leaflet') ||
                id.includes('node_modules/react-leaflet')) {
              return 'vendor-map';
            }
            if (id.includes('node_modules/react/') ||
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/scheduler/')) {
              return 'vendor-react';
            }
          }
        }
      },
      chunkSizeWarningLimit: 700,
    },
  };
});
