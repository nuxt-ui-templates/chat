<script setup lang="ts">
import type { DefineComponent } from 'vue'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport, isReasoningUIPart, isTextUIPart, isToolUIPart, getToolName } from 'ai'
import type { UIMessage } from 'ai'
import { useClipboard } from '@vueuse/core'
import { isReasoningStreaming, isToolStreaming, getTextFromMessage } from '@nuxt/ui/utils/ai'
import ProseStreamPre from '../../components/prose/PreStream.vue'
import { UButton } from '#components'

const components = {
  pre: ProseStreamPre as unknown as DefineComponent,
  button: UButton
}

const route = useRoute()
const toast = useToast()
const clipboard = useClipboard()
const { model } = useModels()

const {
  dropzoneRef,
  isDragging,
  open,
  files,
  isUploading,
  uploadedFiles,
  removeFile,
  clearFiles
} = useFileUploadWithStatus(route.params.id as string)

const { data } = await useFetch(`/api/chats/${route.params.id}`, {
  cache: 'force-cache'
})
if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
}

const input = ref('')

const { csrf, headerName } = useCsrf()

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${data.value.id}`,
    headers: { [headerName]: csrf },
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
  if (input.value.trim() && !isUploading.value) {
    chat.sendMessage({
      text: input.value,
      files: uploadedFiles.value.length > 0 ? uploadedFiles.value : undefined
    })
    input.value = ''
    clearFiles()
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
    class="relative min-h-0"
    :ui="{ body: 'p-0 sm:p-0 overscroll-none' }"
  >
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <div ref="dropzoneRef" class="flex flex-1">
        <DragDropOverlay :show="isDragging" />

        <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
          <UChatMessages
            should-auto-scroll
            :messages="chat.messages"
            :status="chat.status"
            :assistant="chat.status !== 'streaming' ? { actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copy }] } : { actions: [] }"
            :spacing-offset="160"
            class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
          >
            <template #files="{ message, parts }">
              <FileAvatar
                v-for="(part, index) in parts"
                :key="`${message.id}-${index}`"
                :name="getFileName(part.url)"
                :type="part.mediaType"
                :preview-url="part.url"
                size="3xl"
              />
            </template>

            <template #content="{ message }">
              <template v-for="(part, index) in getMergedParts(message.parts)" :key="`${message.id}-${part.type}-${index}`">
                <UChatReasoning
                  v-if="isReasoningUIPart(part)"
                  :text="part.text"
                  :streaming="isReasoningStreaming(message, index, chat)"
                  chevron="leading"
                >
                  <MDC
                    :value="part.text"
                    :cache-key="`reasoning-${message.id}-${index}`"
                    class="*:first:mt-0 *:last:mb-0"
                  />
                </UChatReasoning>

                <template v-else-if="isToolUIPart(part)">
                  <ToolChart
                    v-if="getToolName(part) === 'chart'"
                    :invocation="{ ...(part as ChartUIToolInvocation) }"
                  />
                  <ToolWeather
                    v-else-if="getToolName(part) === 'weather'"
                    :invocation="{ ...(part as WeatherUIToolInvocation) }"
                  />
                  <UChatTool
                    v-else-if="getToolName(part) === 'web_search' || getToolName(part) === 'google_search'"
                    :text="isToolStreaming(part) ? 'Searching the web...' : 'Searched the web'"
                    :suffix="getSearchQuery(part)"
                    :streaming="isToolStreaming(part)"
                    chevron="leading"
                  >
                    <ToolSearchSources :sources="getSources(part)" />
                  </UChatTool>
                </template>

                <template v-else-if="isTextUIPart(part)">
                  <!-- Only render markdown for assistant messages to prevent XSS from user input -->
                  <MDCCached
                    v-if="message.role === 'assistant'"
                    :value="part.text"
                    :cache-key="`${message.id}-${index}`"
                    :components="components"
                    :parser-options="{ highlight: false }"
                    class="*:first:mt-0 *:last:mb-0"
                  />
                  <!-- User messages are rendered as plain text (safely escaped by Vue) -->
                  <p v-else-if="message.role === 'user'" class="whitespace-pre-wrap">
                    {{ part.text }}
                  </p>
                </template>
              </template>
            </template>
          </UChatMessages>

          <UChatPrompt
            v-model="input"
            :error="chat.error"
            :disabled="isUploading"
            variant="subtle"
            class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
            :ui="{ base: 'px-1.5' }"
            @submit="handleSubmit"
          >
            <template v-if="files.length > 0" #header>
              <div class="flex flex-wrap gap-2">
                <FileAvatar
                  v-for="fileWithStatus in files"
                  :key="fileWithStatus.id"
                  :name="fileWithStatus.file.name"
                  :type="fileWithStatus.file.type"
                  :preview-url="fileWithStatus.previewUrl"
                  :status="fileWithStatus.status"
                  :error="fileWithStatus.error"
                  removable
                  @remove="removeFile(fileWithStatus.id)"
                />
              </div>
            </template>

            <template #footer>
              <div class="flex items-center gap-1">
                <FileUploadButton :open="open" />

                <ModelSelect />
              </div>

              <UChatPromptSubmit
                :status="chat.status"
                :disabled="isUploading"
                color="neutral"
                size="sm"
                @stop="chat.stop()"
                @reload="chat.regenerate()"
              />
            </template>
          </UChatPrompt>
        </UContainer>
      </div>
    </template>
  </UDashboardPanel>
</template>
