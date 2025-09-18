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
const images = ref<File[]>([])
const isDragOver = ref(false)

function createObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()

  if (e.dataTransfer?.types.includes('Files')) {
    isDragOver.value = true
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()

  isDragOver.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length > 0) {
    images.value = [...images.value, ...imageFiles]
  }
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length > 0) {
    images.value = [...images.value, ...imageFiles]
  }

  input.value = ''
}

function removeImage(index: number) {
  const imageToRemove = images.value[index]
  if (imageToRemove) {
    URL.revokeObjectURL(createObjectUrl(imageToRemove))
    images.value.splice(index, 1)
  }
}

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${data.value.id}`,
    body: {
      model: model.value
    }
  }),
  onFinish() {
    refreshNuxtData('chats')
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

async function convertFilesToDataURLs(files: FileList) {
  return Promise.all(
    Array.from(files).map(
      file =>
        new Promise<{
          type: 'file'
          mediaType: string
          url: string
        }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              type: 'file',
              mediaType: file.type,
              url: reader.result as string
            })
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
    )
  )
}

async function handleSubmit(e: Event) {
  e.preventDefault()
  if (input.value.trim()) {
    chat.sendMessage({
      text: input.value,
      files: images.value ? await convertFilesToDataURLs(images.value) : undefined
    })
    input.value = ''
    images.value = []
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
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <div
        v-if="isDragOver"
        class="absolute inset-0 m-4 z-50 bg-radial from-primary/10 from-10% to-primary/20 border-2 border-primary/30 rounded-lg flex items-center justify-center backdrop-blur-lg pointer-events-none"
      >
        <div class="text-center">
          <UIcon name="i-lucide-upload" class="size-12 mb-4" />
          <p class="text-lg font-medium">
            Drop your images here
          </p>
          <p class="text-sm text-muted">
            Supported formats: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6 relative">
        <UChatMessages
          should-auto-scroll
          :messages="chat.messages"
          :status="chat.status"
          :assistant="{ actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copy }] }"
          class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
          :spacing-offset="160"
        >
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
                <ToolWeather v-if="part.type === 'tool-weather'" :key="`${part.type}-${part.state}`" :invocation="part" />
              </template>
              <div v-if="message.role === 'user' && message.parts.some((part: { type: string }) => part.type === 'file')" class="flex flex-wrap gap-2">
                <div v-for="(part, index) in message.parts.filter((part: { type: string }) => part.type === 'file')" :key="`${part.type}-${index}-${message.id}`">
                  <UAvatar
                    size="3xl"
                    :src="part.url"
                    icon="i-lucide-image"
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

          <template v-if="images.length > 0" #header>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(image, index) in images"
                :key="index"
                class="relative group"
              >
                <UAvatar
                  size="3xl"
                  :src="createObjectUrl(image)"
                  icon="i-lucide-image"
                  class="border-2 border-default rounded-lg"
                />
                <UButton
                  icon="i-lucide-x"
                  size="2xs"
                  color="neutral"
                  variant="solid"
                  class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  @click="removeImage(index)"
                />
              </div>
            </div>
          </template>
          <template #footer>
            <div class="flex items-center gap-2">
              <label for="file-upload" class="cursor-pointer">
                <UButton
                  icon="i-lucide-paperclip"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  as="span"
                />
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              >
              <ModelSelect v-model="model" />
            </div>
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
