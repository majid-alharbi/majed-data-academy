import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /<repo>/, so assets must use that base.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/majed-data-academy/',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
