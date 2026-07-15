import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://catalise.me',
  trailingSlash: 'never',

  build: {
    assets: '_astro',
  },

  vite: {
    css: {
      devSourcemap: true,
    },
  },

  integrations: [sitemap({
    filter: (page) => !page.endsWith('/404') && !page.endsWith('/404/'),
  })],
});
