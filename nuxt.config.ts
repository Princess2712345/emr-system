// nuxt.config.ts
import { resolve } from 'path'

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
      inline: ['@prisma/client']
    }
  },

  // Use resolve() to turn this into a clean, absolute Windows path
  alias: {
    'db-client': resolve(__dirname, './node_modules/db-client')
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          'db-client': ['./node_modules/db-client']
        }
      }
    }
  },

  devtools: { enabled: true }
})