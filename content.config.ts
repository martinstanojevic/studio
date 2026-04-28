import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    resources: defineCollection({
      type: 'page',
      source: {
        // Object form so we can attach auth (and pin a branch if needed).
        // The string-form `repository: 'https://github.com/owner/repo'` also works
        // for unauthenticated public access, but anonymous GitHub API requests
        // are rate-limited (60/hr per IP), which trips up `npm run dev` quickly.
        repository: {
          url: 'https://github.com/martinstanojevic/studio-content',
          branch: 'main',
          auth: {
            // GitHub PAT auth uses the token as the password and any non-empty
            // username — the GitHub API ignores the username for token auth.
            username: 'token',
            token: process.env.GITHUB_TOKEN ?? '',
          },
        },
        include: 'resources/**/*.md',
      },
      schema: z.object({
        title: z.string(),
        shortDescription: z.string(),
        whatStudentsDo: z.string(),

        type: z.enum(['JNB', 'Worksheet', 'Slide deck', 'Activity', 'Assessment', 'Reading']),
        jnbSubtype: z.string().optional(),
        function: z.enum(['Teaching', 'Assessment', 'Practice', 'Discussion', 'Project']),
        modality: z.enum(['Online', 'Paper-based', 'Hybrid']),
        coverage: z.enum(['Page', 'Section', 'Chapter', 'Book', 'Concept']),

        textbookVersions: z.array(z.string()),
        learningGoals: z.array(z.string()),
        topicTags: z.array(z.string()),

        lengthMinutes: z.number(),
        extraMaterialsNeeded: z.boolean(),
        extraMaterialsList: z.array(z.string()).optional(),
        studentDataCollectionRequired: z.boolean(),

        dataset: z.object({
          name: z.string(),
          source: z.string(),
          variableCount: z.number(),
          variableTypes: z.array(z.enum(['numeric', 'categorical', 'ordinal', 'datetime', 'text'])),
          topicTags: z.array(z.string()),
        }).optional(),

        lastUpdated: z.string(), // ISO date string; Studio handles dates better as strings
      }),
    }),
  },
})
