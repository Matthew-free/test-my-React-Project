import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to handle @google/genai import
const externalGoogleGenAI = () => ({
  name: 'external-google-genai',
  resolveId(id: string) {
    if (id === '@google/genai') {
      return { id, external: true };
    }
    return null;
  }
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Use relative base so this bundle can run under a subfolder (public/last-light)
      base: './',
      server: {
        port: 3001,
        host: '0.0.0.0',
        headers: {
          'Content-Security-Policy': "frame-ancestors 'self' http://localhost:3000",
          'Access-Control-Allow-Origin': '*'
        }
      },
      plugins: [react(), externalGoogleGenAI()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        exclude: ['@google/genai']
      },
      build: {
        rollupOptions: {
          external: ['@google/genai']
        }
      }
    };
});
