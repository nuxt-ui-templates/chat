<script setup lang="ts">
import type { DefineComponent } from 'vue'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { useClipboard } from '@vueuse/core'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import ProseStreamPre from '../../components/prose/PreStream.vue'

const components = {
  pre: ProseStreamPre as unknown as DefineComponent
}

const route = useRoute()
const toast = useToast()
const clipboard = useClipboard()
const { model } = useModels()

const { data } = await useFetch(`/api/chats/${route.params.id}`, {
  cache: 'force-cache'
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Chat not found', fatal: true })
}

const input = ref('')
// workaround to show loader when status changes from submitted to streaming https://github.com/vercel/ai/issues/7586
const lastMessage: ComputedRef<UIMessage | undefined> = computed(() => chat.messages.at(-1))
const showLoader = computed(() => chat.status === 'streaming' && lastMessage.value?.role === 'assistant' && lastMessage.value?.parts?.length === 0)

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${data.value.id}`,
    body: {
      model: model.value
    }
  }),
  onData: (dataPart) => {
    if (dataPart.type === 'data-chat-title') {
      refreshNuxtData('chats')
    }
  },
  onError(error) {
    const { message } = typeof error.message === 'string' && error.message[0] === '{' ? JSON.parse(error.message) : error
    toast.add({
      description: message,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 0
    })
  }
})

function handleSubmit(e: Event) {
  e.preventDefault()
  if (input.value.trim()) {
    chat.sendMessage({
      text: input.value
    })
    input.value = ''
  }
}

const copied = ref(false)

function copy(e: MouseEvent, message: UIMessage) {
  clipboard.copy(getTextFromMessage(message))

  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}

onMounted(() => {
  if (data.value?.messages.length === 1) {
    chat.regenerate()
  }
})
</script>

<template>
  <UDashboardPanel id="chat" class="relative" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
        <UChatMessages
          should-auto-scroll
          :messages="chat.messages"
          :status="chat.status"
          :assistant="chat.status !== 'streaming' ? { actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copy }] } : { actions: [] }"
          class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
          :spacing-offset="160"
        >
          <template #content="{ message }">
            <div class="space-y-4">
              <UButton
                v-if="showLoader && message.role === 'assistant'"
                loading
                label="Thinking..."
                variant="link"
                color="neutral"
                size="sm"
                class="px-0"
              />
              <template v-for="(part, index) in message.parts" :key="`${part.type}-${index}-${message.id}-${'state' in part ? part.state : ''}`">
                <Reasoning
                  v-if="part.type === 'reasoning'"
                  :key="`${part.type}-${message.id}`"
                  :text="part.text"
                  :is-streaming="part.state !== 'done'"
                />
                <MDCCached
                  v-else-if="part.type === 'text'"
                  :value="part.text"
                  :cache-key="`${message.id}-${index}`"
                  unwrap="p"
                  :components="components"
                  :parser-options="{ highlight: false }"
                />
                <ToolWeather
                  v-else-if="part.type === 'tool-weather'"
                  :invocation="(part as WeatherUIToolInvocation)"
                />
                <ToolChart
                  v-else-if="part.type === 'tool-chart'"
                  :invocation="(part as ChartUIToolInvocation)"
                />
              </template>
            </div>
          </template>
        </UChatMessages>

        <UChatPrompt
          v-model="input"
          :error="chat.error"
          variant="subtle"
          class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
          @submit="handleSubmit"
        >
          <template #footer>
            <ModelSelect v-model="model" />

            <UChatPromptSubmit
              :status="chat.status"
              color="neutral"
              @stop="chat.stop"
              @reload="chat.regenerate"
            />
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
