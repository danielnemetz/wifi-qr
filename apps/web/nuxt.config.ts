import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',

  modules: ['shadcn-nuxt', '@nuxtjs/color-mode', '@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'de', name: 'Deutsch', file: 'de.json' },
    ],
    langDir: 'locales/',
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_lang',
      fallbackLocale: 'en',
    },
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    preset: 'node-server',
    esbuild: {
      options: {
        target: 'node18',
      },
    },
    // Native node deps used by src/ must not be bundled by Nitro
    externals: {
      inline: [],
    },
    rollupConfig: {
      external: ['canvas', 'pdfkit', 'qr-code-styling-node'],
    },
  },

  build: {
    transpile: ['@qr/core'],
  },
})
