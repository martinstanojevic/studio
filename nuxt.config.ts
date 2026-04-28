export default defineNuxtConfig({
  compatibilityDate: '2026-04-28',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    'nuxt-studio',
  ],
  content: {
    // Build-time GitHub source. Token is supplied via content.config.ts auth.token,
    // which reads process.env.GITHUB_TOKEN. There is no @nuxt/content-defined env var
    // name — we pick GITHUB_TOKEN for compatibility with GitHub CLI conventions.
  },
  studio: {
    // Studio publishes commits to the *content* repo, not this app repo.
    repository: {
      provider: 'github',
      owner: 'martinstanojevic',
      repo: 'studio-content',
      branch: 'main',
    },
  },
  css: ['~/assets/css/main.css'],
})
