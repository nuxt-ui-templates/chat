<script setup lang="ts">
import { useChat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import type { ChatPromptQueueItem } from '@nuxt/ui'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'

const route = useRoute()
const toast = useToast()
const { model } = useModels()
const { webSearch, reasoning } = useChatSettings()
const { csrf, headerName } = useCsrf()

const { data } = await useFetch(`/api/chats/${route.params.id}`, {
  key: `chat-${route.params.id}`,
  cache: 'force-cache'
})

const isOwner = computed(() => data.value?.isOwner ?? false)
const visibility = ref<'public' | 'private'>(data.value?.visibility ?? 'private')
const title = ref<string | null>(data.value?.title ?? null)

watch(() => data.value?.title, (next) => {
  title.value = next ?? null
})

const { data: votes } = await useLazyFetch(`/api/chats/${route.params.id}/votes`, {
  immediate: isOwner.value
})

const input = ref('')

const {
  messages,
  status,
  error,
  sendMessage,
  regenerate,
  stop,
  experimental_queuedMessages,
  experimental_removeQueuedMessage,
  experimental_sendQueuedMessageNow
} = useChat({
  id: data.value?.id,
  // Messages sent while a response is in progress wait in `experimental_queuedMessages` and go out one at a time
  experimental_queue: true,
  messages: data.value?.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${data.value?.id}`,
    headers: { [headerName]: csrf },
    body: () => ({
      model: model.value,
      webSearch: webSearch.value,
      reasoning: reasoning.value
    })
  }),
  onData: async (dataPart) => {
    if (dataPart.type === 'data-chat-title') {
      await refreshNuxtData('chats')
      const chatsCache = useNuxtData<{ id: string, label: string }[]>('chats')
      const updated = chatsCache.data.value?.find(c => c.id === data.value!.id)
      if (updated && updated.label !== 'Untitled') {
        title.value = updated.label
      }
    }
  },
  onError(error) {
    let message = error.message
    if (typeof message === 'string' && message[0] === '{') {
      try {
        message = JSON.parse(message).message || message
      } catch {
        // keep original message on malformed JSON
      }
    }

    toast.add({
      description: message,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 0
    })
  }
})

// A submitted message waits here while its files upload, then goes to the chat in the order it was sent
const pending = ref<ChatPromptQueueItem[]>([])
// The file behind each file part, so a queued message can go back to the prompt with its files
const filesByUrl = new Map<string, File>()

function toQueueItem(message: UIMessage): ChatPromptQueueItem {
  return {
    id: message.id,
    text: getTextFromMessage(message),
    files: message.parts.flatMap(part => part.type === 'file' && filesByUrl.has(part.url) ? [filesByUrl.get(part.url)!] : [])
  }
}

function isSameItem(a: ChatPromptQueueItem, b: ChatPromptQueueItem) {
  return a.id ? a.id === b.id : toRaw(a) === toRaw(b)
}

// `UChatPrompt` edits the queue through `v-model:queue`: the chat holds the messages waiting for the response, `pending` the ones whose files still upload
const queue = computed<ChatPromptQueueItem[]>({
  get: () => [...experimental_queuedMessages.value.map(toQueueItem), ...pending.value],
  set: (next) => {
    for (const item of queue.value.filter(item => !next.some(n => isSameItem(n, item)))) {
      if (item.id) {
        experimental_removeQueuedMessage(item.id)
      } else {
        pending.value = pending.value.filter(p => !isSameItem(p, item))
      }
    }

    // A message submitted while the chat is busy
    const added = next.filter(item => !queue.value.some(q => isSameItem(q, item)))
    if (added.length) {
      for (const item of added) {
        holdFiles(item.files)
      }
      pending.value.push(...added)
      sendPending()
    }
  }
})

const {
  files,
  promptFiles,
  uploading,
  holdFiles,
  isUploading,
  getFileParts
} = useFileUploadWithStatus(route.params.id as string, { queue, messages })

function sendPending() {
  // A message waits for its files to finish uploading, the ones after it wait too
  while (pending.value[0] && !isUploading(pending.value[0].files)) {
    const item = pending.value.shift()!
    const uploaded = getFileParts(item.files)
    // Nothing left to send when its only file failed to upload
    if (!item.text.trim() && !uploaded.length) continue

    for (const { file, part } of uploaded) {
      filesByUrl.set(part.url, file)
    }
    const parts = uploaded.map(({ part }) => part)
    sendMessage(item.text.trim() ? { text: item.text, files: parts } : { files: parts })
  }
}

// Also runs when the files of the next message finish uploading
watch(() => isUploading(pending.value[0]?.files), sendPending)

function handleSubmit(e: Event) {
  e.preventDefault()

  if (!input.value.trim() && !promptFiles.value.length) return

  const item = { text: input.value, files: promptFiles.value }
  holdFiles(item.files)
  pending.value.push(item)
  input.value = ''
  sendPending()
}

// The file parts of the queued messages are the only ones that can go back to the prompt
watch(experimental_queuedMessages, (queued: UIMessage[]) => {
  const urls = new Set(queued.flatMap(message => message.parts.flatMap(part => part.type === 'file' ? [part.url] : [])))
  for (const url of filesByUrl.keys()) {
    if (!urls.has(url)) filesByUrl.delete(url)
  }
})

// The chat stops the response and sends the message next, one whose files still upload can't skip ahead
function onSend(item: ChatPromptQueueItem) {
  if (item.id) {
    experimental_sendQueuedMessageNow(item.id)
  } else {
    sendPending()
  }
}

const editingMessageId = ref<string | null>(null)

function startEdit(message: UIMessage) {
  if (editingMessageId.value) return

  editingMessageId.value = message.id
}

async function saveEdit(message: UIMessage, text: string) {
  try {
    await $fetch(`/api/chats/${data.value!.id}/messages`, {
      method: 'DELETE',
      headers: { [headerName]: csrf },
      body: { messageId: message.id, type: 'edit' }
    })
  } catch {
    toast.add({ description: 'Failed to save edit.', icon: 'i-lucide-alert-circle', color: 'error' })
    return
  }

  editingMessageId.value = null
  sendMessage({ text, messageId: message.id })
}

async function regenerateMessage(message: UIMessage) {
  try {
    await $fetch(`/api/chats/${data.value!.id}/messages`, {
      method: 'DELETE',
      headers: { [headerName]: csrf },
      body: { messageId: message.id, type: 'regenerate' }
    })
  } catch {
    toast.add({ description: 'Failed to regenerate.', icon: 'i-lucide-alert-circle', color: 'error' })
    return
  }

  regenerate({ messageId: message.id })
}

function getVote(messageId: string) {
  const vote = votes.value?.find(v => v.messageId === messageId)
  if (!vote) return null
  return !!vote.isUpvoted
}

async function vote(message: UIMessage, isUpvoted: boolean) {
  const snapshot = (votes.value ?? []).map(v => ({ ...v }))
  const toggling = getVote(message.id) === isUpvoted
  const next = toggling ? null : isUpvoted

  votes.value = next === null
    ? (votes.value ?? []).filter(v => v.messageId !== message.id)
    : [
        ...(votes.value ?? []).filter(v => v.messageId !== message.id),
        { chatId: data.value!.id, messageId: message.id, isUpvoted: next }
      ]

  try {
    await $fetch(`/api/chats/${data.value!.id}/votes`, {
      method: 'POST',
      headers: { [headerName]: csrf },
      body: next === null ? { messageId: message.id } : { messageId: message.id, isUpvoted: next }
    })
  } catch {
    votes.value = snapshot
    toast.add({
      description: 'Failed to save vote',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

onMounted(() => {
  if (isOwner.value && data.value?.messages.length === 1) {
    regenerate()
  }
})
</script>

<template>
  <UDashboardPanel
    v-if="data?.id"
    id="chat"
    class="relative min-h-0"
    :ui="{ body: 'p-0 sm:p-0 overscroll-none scroll-pt-(--ui-header-height)' }"
  >
    <template #header>
      <Navbar>
        <template #title>
          <ChatTitle
            :chat-id="data!.id"
            :title="title"
            :is-owner="isOwner"
            @update:title="title = $event"
          />
        </template>

        <ChatVisibility
          v-if="isOwner"
          :chat-id="data!.id"
          :visibility="visibility"
          @update:visibility="visibility = $event"
        />
      </Navbar>
    </template>

    <template #body>
      <div class="flex flex-1">
        <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
          <UChatMessages
            should-auto-scroll
            :messages="messages"
            :status="status"
            :class="['pt-(--ui-header-height)', !isOwner && 'pb-4 sm:pb-6']"
            :ui="{ footer: 'pt-4 sm:pt-6' }"
          >
            <template #indicator>
              <div class="flex items-center gap-1.5">
                <ChatIndicator />

                <UChatShimmer text="Thinking..." class="text-sm" />
              </div>
            </template>

            <template #files="{ message, parts }">
              <UChatAttachment
                v-for="(part, index) in parts"
                :key="`${message.id}-${index}`"
                :name="removeRandomSuffix(getFileName(part.url))"
                :type="part.mediaType"
                :url="part.url"
                :icon="getFileIcon(part.mediaType, part.url)"
              />
            </template>

            <template #content="{ message, streaming }">
              <ChatMessageContent
                :message="message"
                :streaming="streaming"
                :editing="isOwner && editingMessageId === message.id"
                @save="saveEdit"
                @cancel-edit="editingMessageId = null"
              />
            </template>

            <template v-if="isOwner" #actions="{ message }">
              <ChatMessageActions
                :message="message"
                :streaming="status === 'streaming' && message.id === messages[messages.length - 1]?.id"
                :editing="editingMessageId === message.id"
                :vote="getVote(message.id)"
                @vote="(_message, isUpvoted) => vote(_message, isUpvoted)"
                @edit="startEdit"
                @regenerate="regenerateMessage"
              />
            </template>

            <template v-if="isOwner" #footer>
              <ChatPrompt
                v-model="input"
                v-model:files="promptFiles"
                v-model:queue="queue"
                :status="status"
                :error="error"
                :uploads="files"
                :uploading="uploading"
                class="[view-transition-name:chat-prompt] rounded-b-none backdrop-blur-sm"
                @submit="handleSubmit"
                @send="onSend"
                @stop="stop()"
                @reload="regenerate()"
              />
            </template>
          </UChatMessages>
        </UContainer>
      </div>
    </template>
  </UDashboardPanel>

  <UContainer v-else class="flex-1 flex flex-col gap-4 sm:gap-6">
    <UError :error="{ statusMessage: 'Chat not found', statusCode: 404 }" class="min-h-full" />
  </UContainer>
</template>
