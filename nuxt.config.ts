// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    exposeConfig: true,
    config: {
      content: [
        './pages/**/*.{vue,js,ts}',
        './layouts/**/*.{vue,js,ts}',
        './components/**/*.{vue,js,ts}',
      ]
    }
  },
  dir: {
    pages: 'pages'
  }
})
