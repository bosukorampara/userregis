import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // important for production builds on Render
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
  },
});