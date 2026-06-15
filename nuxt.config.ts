// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxt/icon'],
  css: ['~/assets/portal.css'],

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
      ]
    }
  },

  future: {
    compatibilityVersion: 4,
  },

  runtimeConfig: {
    databaseUrl: '',
  },

  nitro: {
    externals: {
      inline: ['@prisma/client', '.prisma/client']
    }
  },

  devtools: { enabled: true }
})
