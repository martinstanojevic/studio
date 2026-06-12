// The app is a light-only design (see colorMode pin in nuxt.config.ts).
// `@nuxtjs/color-mode` persists the user's choice in a cookie/localStorage,
// which takes precedence over the configured `preference`. There's no theme
// toggle today, but a stale stored value from earlier could still flip the UI
// to dark. Force it back to light on every client load as a hard lock.
export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()
  if (colorMode.preference !== 'light') colorMode.preference = 'light'
  if (colorMode.value !== 'light') colorMode.value = 'light'
})
