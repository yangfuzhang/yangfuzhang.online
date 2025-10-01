import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const prosemirrorCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/prosemirror" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
  }),
});

const reactCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/react" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
  }),
});

const vueCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/vue" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
  }),
});

const snippetsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/snippets" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
  }),
});

export const collections = {
  prosemirror: prosemirrorCollection,
  react: reactCollection,
  vue: vueCollection,
  snippets: snippetsCollection,
};
