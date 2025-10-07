<script setup lang="ts">
import type { DefineComponent } from 'vue'
import { Chat } from '@ai-sdk/vue'
import type { UIMessage, UIMessagePart, UIDataTypes, UITools } from 'ai'
import { DefaultChatTransport } from 'ai'
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

const files = ref<File[]>([])
const { dropzoneRef, isDragging } = useFileUpload({
  multiple: true,
  onUpdate: (newFiles) => {
    files.value = [...files.value, ...newFiles]
  }
})

const { data } = await useFetch(`/api/chats/${route.params.id}`, {
  cache: 'force-cache'
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Chat not found', fatal: true })
}

const input = ref('')

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

async function handleSubmit(e: Event) {
  e.preventDefault()
  if (input.value.trim()) {
    chat.sendMessage({
      text: input.value,
      files: files.value.length > 0 ? await convertFilesToDataURLs(files.value) : undefined
    })
    input.value = ''
    clearFiles(files)
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
  <UDashboardPanel
    id="chat"
    class="relative"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <DragDropOverlay :show="isDragging" />
      <UContainer ref="dropzoneRef" class="flex-1 flex flex-col gap-4 sm:gap-6 relative">
        <UChatMessages
          should-auto-scroll
          :messages="chat.messages"
          :status="chat.status"
          :assistant="{ actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copy }] }"
          class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
          :spacing-offset="160"
        >
          <template #indicator>
            <UButton
              loading
              label="Thinking..."
              variant="link"
              color="neutral"
              class="p-0"
            />
          </template>
          <template #content="{ message }">
            <div class="space-y-4">
              <template v-for="(part, index) in message.parts" :key="`${part.type}-${index}-${message.id}`">
                <UButton
                  v-if="part.type === 'reasoning' && part.state !== 'done'"
                  label="Thinking..."
                  variant="link"
                  color="neutral"
                  class="p-0"
                  loading
                />
              </template>
              <MDCCached
                :value="getTextFromMessage(message)"
                :cache-key="message.id"
                unwrap="p"
                :components="components"
                :parser-options="{ highlight: false }"
              />
              <template v-for="(part, index) in message.parts" :key="`${part.type}-${index}-${message.id}`">
                <ToolWeather v-if="part.type === 'tool-weather'" :key="`${part.type}-${part.state}`" :invocation="part as WeatherUIToolInvocation" />
              </template>
              <div v-if="message.role === 'user' && message.parts.some((part: UIMessagePart<UIDataTypes, UITools>) => part.type === 'file')" class="flex flex-wrap gap-2">
                <div v-for="(part, index) in message.parts.filter((part: UIMessagePart<UIDataTypes, UITools>) => part.type === 'file')" :key="`${part.type}-${index}-${message.id}`">
                  <UAvatar
                    size="3xl"
                    :src="part.url"
                    :icon="part.mediaType.startsWith('image/') ? 'i-lucide-image' : 'i-lucide-file'"
                    class="border-2 border-default rounded-lg"
                  />
                </div>
              </div>
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
          <UChatPromptSubmit
            :status="chat.status"
            color="neutral"
            @stop="chat.stop"
            @reload="chat.regenerate"
          />

          <template v-if="files.length > 0" #header>
            <FilePreview v-model="files" />
          </template>
          <template #footer>
            <div class="flex items-center gap-2">
              <FileUploadButton @files-selected="files.push(...$event)" />
              <ModelSelect v-model="model" />
            </div>
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
