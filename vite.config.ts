import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

// Plugins follow Untitled UI's official Vite integration.
export default defineConfig(({ isPreview }) => ({
  appType: isPreview ? 'mpa' : 'spa',
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss(), {
    name: 'portfolio-preview-404',
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (url.pathname.endsWith('/')) req.url = `${url.pathname}index.html${url.search}`;
        next();
      });
      return () => server.middlewares.use((_req, res) => {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(readFileSync(new URL('./dist/404.html', import.meta.url), 'utf8'));
      });
    },
  }],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: '127.0.0.1', port: 4322, open: false },
  preview: { host: '127.0.0.1', port: 4322, open: false },
}));
