import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [UnoCSS(), sitemap()],
  output: 'static',
  site: 'https://cozymoney.kr',

  server: {
    open: true,
  },
});
