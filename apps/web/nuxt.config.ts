import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',

  modules: ['shadcn-nuxt', '@nuxtjs/color-mode'],

  colorMode: {
    classSuffix: '',
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
      external: ['canvas', 'qr-code-styling-node'],
    },
  },

  build: {
    transpile: ['@qr/core'],
  },
})
