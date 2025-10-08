import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import { remarkReadingTime } from "./remark-reading-time.mjs";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",

  adapter: node({
    mode: "standalone",
  }),

  markdown: {
    remarkPlugins: [remarkReadingTime],
  },

  integrations: [],

  vite: {
    plugins: [tailwindcss()],
  },
});
