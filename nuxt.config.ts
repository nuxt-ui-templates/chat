// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/mdc',
    '@nuxthub/core',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  mdc: {
    highlight: {
      // noApiRoute: true
      shikiEngine: 'javascript'
    }
  },

  experimental: {
    viewTransition: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  hub: {
    ai: true,
    database: true
  },

  vite: {
    $server: {
      build: {
        rollupOptions: {
          output: {
            preserveModules: true
          }
        }
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
