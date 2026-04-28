import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    resources: defineCollection({
      type: 'page',
      // Local filesystem source for development
      source: 'resources/**/*.md',
      // source: {
      //   // Object form so we can attach auth (and pin a branch if needed).
      //   // The string-form `repository: 'https://github.com/owner/repo'` also works
      //   // for unauthenticated public access, but anonymous GitHub API requests
      //   // are rate-limited (60/hr per IP), which trips up `npm run dev` quickly.
      //   repository: {
      //     url: 'https://github.com/martinstanojevic/studio',
      //     branch: 'main',
      //     // Only attach auth when a token is set; otherwise GitHub treats the
      //     // request as anonymous (60/hr rate limit, fine for a small eval repo).
      //     // Sending an empty `auth.token` produces a 401, not anonymous fallback.
      //     ...(process.env.GITHUB_TOKEN
      //       ? { auth: { username: 'token', token: process.env.GITHUB_TOKEN } }
      //       : {}),
      //   },
      //   include: 'resources/**/*.md',
      // },
      schema: z.object({
        title: z.string(),
        description: z.string(),

        type: z.enum(['JNB', 'Worksheet', 'Slide deck', 'Activity', 'Assessment', 'Reading']),
        function: z.enum(['Teaching', 'Assessment', 'Practice', 'Discussion', 'Project']),
        modality: z.enum(['Online', 'Paper-based', 'Hybrid']),
        coverage: z.enum(['Page', 'Section', 'Chapter', 'Book', 'Concept']),

        textbookVersions: z.array(z.string()),
        topicTags: z.array(z.string()),
        learningGoals: z.array(z.string()),

        lengthMinutes: z.number(),
        extraMaterials: z.array(z.string()).default([]),

        dataset: z.object({
          name: z.string(),
          variableTypes: z.array(z.enum(['numeric', 'categorical', 'ordinal', 'datetime', 'text'])),
        }).optional(),

        // Auto-derived from file mtime via the content:file:afterParse hook in
        // nuxt.config.ts. Stored on the doc so queries can sort by it.
        lastModified: z.string().optional(),
      }),
    }),
  },
})
