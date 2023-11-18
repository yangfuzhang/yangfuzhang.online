import { defineConfig } from 'astro/config';
import node from "@astrojs/node";
import vue from "@astrojs/vue";
import { remarkReadingTime } from './remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  markdown: {
    remarkPlugins: [remarkReadingTime]
  },
  integrations: [vue()]
});