import { z, defineCollection } from 'astro:content';

const prosemirrorCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
  }),
});

const vscodeCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
  }),
});

const reactCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
  }),
});

const vueCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
  }),
});

export const collections = {
  'prosemirror': prosemirrorCollection,
  'vscode': vscodeCollection,
  'react': reactCollection,
  'vue': vueCollection,
};