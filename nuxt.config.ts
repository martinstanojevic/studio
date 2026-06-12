import { statSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// Scanned once at build time so the admin files panel works on any deploy
// target without runtime filesystem access to /public. New uploads published
// through Studio trigger a rebuild, which refreshes this list.
function scanResourceFiles() {
  const publicDir = fileURLToPath(new URL('./public', import.meta.url))
  const base = join(publicDir, 'resources')
  try {
    return readdirSync(base, { withFileTypes: true, recursive: true })
      .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
      .map((entry) => {
        const abs = join(entry.parentPath ?? base, entry.name)
        const stats = statSync(abs)
        return {
          name: entry.name,
          // Percent-encode each segment so the path is paste-ready for the
          // `files[].src` frontmatter field (matches existing %20-style paths).
          path: `/${relative(publicDir, abs).split(sep).map(encodeURIComponent).join('/')}`,
          size: stats.size,
          modifiedAt: stats.mtime.toISOString(),
        }
      })
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
  } catch {
    return []
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2026-04-28',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    'nuxt-studio',
  ],
  runtimeConfig: {
    // Server-only (kept out of the client payload); served via /api/admin/files.
    resourceFilesManifest: scanResourceFiles(),
  },
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
