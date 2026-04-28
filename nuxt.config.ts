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
  css: ['~/assets/css/main.css'],
})
