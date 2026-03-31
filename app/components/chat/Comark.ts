import highlight from '@comark/nuxt/plugins/highlight'
import SourceLink from './SourceLink.vue'

export default defineComarkComponent({
  name: 'ChatComark',
  plugins: [highlight()],
  components: {
    'source-link': SourceLink
  }
})
