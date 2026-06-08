import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    teachingResources: defineCollection({
      type: 'page',
      source: 'resources/**/*.md',
      schema: z.object({
        title: z.string(),
        type: z.enum(['notebook', 'activity', 'worksheet', 'assessment', 'dataset']),
        description: z.string(),
        books: z.array(z.string()).default([]),
        chapter: z.string().optional(),
        duration: z.number().optional(),
        tags: z.array(z.string()).default([]),
        datasetName: z.string().optional(),
        datasetDescription: z.string().optional(),
        file: z.string().optional(),
        featured: z.boolean().default(false),
        published: z.boolean().default(true),
      }),
    }),
    teachingResourcesPages: defineCollection({
      type: 'page',
      source: '*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
      }),
    }),
  },
})
