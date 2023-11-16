import { z, defineCollection } from 'astro:content';

const prosemirrorCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
  }),
});

export const collections = {
  'prosemirror': prosemirrorCollection,
};