import { statSync } from 'node:fs'

export default defineNuxtConfig({
  compatibilityDate: '2026-04-28',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    'nuxt-studio',
  ],
  studio: {
    repository: {
      provider: 'github',
      owner: 'martinstanojevic',
      repo: 'studio',
      branch: 'main',
    },
  },
  // The CourseKata design is a light theme. Pin the color mode to 'light' so
  // Nuxt UI / Tailwind don't flip to dark based on OS preference and clash with
  // the CK background and semantic tokens.
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },
  hooks: {
    // Auto-derive `lastModified` from the file's mtime instead of asking
    // authors to maintain a `lastUpdated` frontmatter field by hand. Runs at
    // build/dev time; cached parsed output is reused until the file changes
    // (which bumps mtime anyway), so this stays in sync.
    'content:file:afterParse': ({ file, content }) => {
      if (!file.path) return
      try {
        const stats = statSync(file.path)
        ;(content as Record<string, unknown>).lastModified = stats.mtime.toISOString()
      } catch {
        // If stat fails (e.g. transient FS issue) leave the field undefined;
        // the schema marks it optional and the UI degrades to no-date.
      }
    },
  },
  css: ['~/assets/css/main.css'],
})
