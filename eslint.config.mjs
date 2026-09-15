// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default withNuxt(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': ['error', { singleline: 3 }]
    }
  },
  {
    files: ['**/*.vue'],
    plugins: { 'better-tailwindcss': betterTailwindcss },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        attributes: [
          ['^(v-bind:|:)?class$', [{ match: 'strings' }, { match: 'objectKeys' }]],
          ['^(v-bind:|:)?ui$', [{ match: 'objectValues' }]]
        ]
      }
    },
    rules: {
      ...betterTailwindcss.configs['correctness-error'].rules,
      'better-tailwindcss/no-unknown-classes': ['error', { ignore: ['^dot-pattern$'] }]
    }
  }
)
