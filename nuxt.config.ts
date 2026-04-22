// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  
  // 1. Enable the Icon module to fix the "Failed to resolve component: Icon" error
  modules: ['@nuxt/icon'],

  // 2. Ensure Nuxt looks for your files inside the /app directory as seen in your folder structure
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true }
})
