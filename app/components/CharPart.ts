import highlight from '@comark/nuxt/plugins/highlight'
import emoji from '@comark/nuxt/plugins/emoji'
import mermaid from '@comark/nuxt/plugins/mermaid'
import { Mermaid } from '@comark/vue/plugins/mermaid'
import jsx from 'shiki/langs/jsx.mjs'

export default defineComarkComponent({
  name: 'CharPart',
  plugins: [
    mermaid(),
    emoji(),
    highlight({
      languages: [jsx]
    })
  ],
  components: {
    Mermaid
  }
})
