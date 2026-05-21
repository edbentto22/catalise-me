import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sobre: resolve(__dirname, 'sobre.html'),
        contato: resolve(__dirname, 'contato.html'),
        operaOs: resolve(__dirname, 'opera-os.html'),
        notFound: resolve(__dirname, '404.html'),
        artefatosOperaOs: resolve(__dirname, 'catalise-artefatos/opera-os-page.html'),
        artefatosMatika: resolve(__dirname, 'catalise-artefatos/matika-landing.html'),
      }
    }
  }
});
