import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import { remarkReadingTime } from "./remark-reading-time.mjs";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",

  adapter: node({
    mode: "standalone",
  }),

  markdown: {
    remarkPlugins: [remarkReadingTime],
  },

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});
