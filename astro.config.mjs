import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://catalise.me',
  trailingSlash: 'never',

  build: {
    assets: '_astro',
  },

  vite: {
    plugins: [tailwindcss()],
    css: {
      devSourcemap: true,
    },
  },

  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404') && !page.endsWith('/404/'),
      i18n: {
        defaultLocale: 'pt',
        locales: { pt: 'pt-BR', en: 'en-US', es: 'es-419' },
      },
    }),
  ],
});
