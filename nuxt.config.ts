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

  // Keep Prisma external so native query-engine binaries load from node_modules
  nitro: {
    externals: {
      external: ['.prisma', '@prisma/client'],
      inline: []
    },
    moduleSideEffects: ['@prisma/client']
  },

  devtools: { enabled: true }
})
