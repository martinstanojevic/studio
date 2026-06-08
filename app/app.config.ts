export default defineAppConfig({
  // Tell Nuxt UI to use the CourseKata purple palette (--color-primary-* in
  // app/assets/css/main.css) as the brand color. Default is 'green'.
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'slate',
    },
  },
  site: {
    title: 'CourseKata Resources',
    tagline: 'Find teaching materials for the CourseKata curriculum.',
    footer: '© CourseKata. Edited via Nuxt Studio.',
  },
})
