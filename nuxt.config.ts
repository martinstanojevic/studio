export default defineNuxtConfig({
  compatibilityDate: '2026-04-28',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    'nuxt-studio',
  ],
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
