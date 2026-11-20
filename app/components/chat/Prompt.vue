<script setup lang="ts">
import type { ChatStatus, UIMessage } from 'ai'

const props = withDefaults(defineProps<{
  status?: ChatStatus
  error?: Error
  /** The upload state of the files, in the same order as `v-model:files`. */
  uploads?: FileWithStatus[]
  uploading?: boolean
  disabled?: boolean
  /** The messages waiting for the response, kept by the chat. */
  queue?: UIMessage[]
}>(), {
  status: 'ready',
  error: undefined,
  queue: undefined,
  uploads: () => []
})

const emit = defineEmits<{
  submit: [event: Event]
  send: [message: UIMessage]
  remove: [message: UIMessage]
  stop: []
  reload: []
}>()

const input = defineModel<string>({ default: '' })
const files = defineModel<File[]>('files', { default: () => [] })

const dictation = ref<'idle' | 'recording' | 'transcribing'>('idle')
const dictationPreview = ref('')
const placeholder = computed(() => {
  if (dictation.value !== 'idle') {
    return dictationPreview.value || (dictation.value === 'recording' ? 'Listening...' : 'Transcribing...')
  }
  if (props.queue && (props.status === 'submitted' || props.status === 'streaming')) {
    return 'Queue a follow-up...'
  }
  return undefined
})

const canDictate = computed(() => dictation.value !== 'idle' || (props.status === 'ready' && !input.value.trim() && !files.value.length))

function appendTranscript(text: string) {
  input.value = input.value.trim() ? `${input.value.trimEnd()} ${text}` : text
}
</script>

<template>
  <UChatPrompt
    v-model="input"
    v-model:files="files"
    :queue="queue"
    :accept="FILE_UPLOAD_CONFIG.acceptPattern"
    :status="status"
    :error="error"
    :disabled="disabled"
    :placeholder="placeholder"
    color="neutral"
    variant="subtle"
    :ui="{ base: ['px-1.5', dictation !== 'idle' && 'placeholder:italic'] }"
    @submit="emit('submit', $event)"
    @send="emit('send', $event)"
    @remove="emit('remove', $event)"
  >
    <template #files="{ remove }">
      <UChatAttachment
        v-for="(upload, index) in uploads"
        :key="upload.id"
        :file="upload.file"
        :icon="getFileIcon(upload.file.type, upload.file.name)"
        :status="upload.status === 'uploaded' ? 'idle' : upload.status"
        :description="upload.error"
        size="sm"
        removable
        @remove="remove(index)"
      />
    </template>

    <template #footer="{ open }">
      <ChatPromptMenu :open="open" />

      <div class="flex items-center gap-1">
        <ModelSelect />

        <ChatDictateButton
          v-if="canDictate"
          v-model:state="dictation"
          v-model:preview="dictationPreview"
          :disabled="uploading || disabled"
          @transcript="appendTranscript"
        />
        <UChatPromptSubmit
          v-else
          :status="status"
          :disabled="uploading || disabled"
          color="neutral"
          size="sm"
          @stop="emit('stop')"
          @reload="emit('reload')"
        />
      </div>
    </template>
  </UChatPrompt>
</template>
