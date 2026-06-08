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
        // Each resource can attach multiple files (e.g., student + teacher
        // versions of a notebook). `path` is a URL under /public, `label` is
        // the display name, and `role` identifies the audience for filtering
        // and UI grouping.
        files: z
          .array(
            z.object({
              path: z.string(),
              label: z.string(),
              role: z.enum(['student', 'teacher', 'supplement']).optional(),
            }),
          )
          .default([]),
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
