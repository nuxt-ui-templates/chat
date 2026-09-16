<script setup lang="ts">
import type { ChatStatus } from 'ai'

const props = withDefaults(defineProps<{
  status?: ChatStatus
  error?: Error
  files?: FileWithStatus[]
  uploading?: boolean
  /** Opens the file picker. */
  open: () => void
}>(), {
  status: 'ready',
  error: undefined,
  files: () => []
})

const emit = defineEmits<{
  submit: [event: Event]
  stop: []
  reload: []
  remove: [id: string]
}>()

const input = defineModel<string>({ default: '' })

const dictation = ref<'idle' | 'recording' | 'transcribing'>('idle')
const dictationPreview = ref('')
const placeholder = computed(() => {
  if (dictation.value === 'idle') return undefined
  return dictationPreview.value || (dictation.value === 'recording' ? 'Listening...' : 'Transcribing...')
})

const canDictate = computed(() => props.status === 'ready' && !input.value.trim() && !props.files.length)

function appendTranscript(text: string) {
  input.value = input.value.trim() ? `${input.value.trimEnd()} ${text}` : text
}
</script>

<template>
  <UChatPrompt
    v-model="input"
    :status="status"
    :error="error"
    :disabled="uploading"
    :placeholder="placeholder"
    color="neutral"
    variant="subtle"
    :ui="{ base: ['px-1.5', dictation !== 'idle' && 'placeholder:italic'] }"
    @submit="emit('submit', $event)"
  >
    <template v-if="files.length > 0" #header>
      <ChatFiles :files="files" @remove="emit('remove', $event)" />
    </template>

    <template #footer>
      <ChatPromptMenu :open="open" />

      <div class="flex items-center gap-1">
        <ModelSelect />

        <ChatDictateButton
          v-if="canDictate"
          v-model:state="dictation"
          v-model:preview="dictationPreview"
          :disabled="uploading"
          @transcript="appendTranscript"
        />
        <UChatPromptSubmit
          v-else
          :status="status"
          :disabled="uploading"
          color="neutral"
          size="sm"
          @stop="emit('stop')"
          @reload="emit('reload')"
        />
      </div>
    </template>
  </UChatPrompt>
</template>
