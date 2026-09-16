<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  transcript: [text: string]
}>()

/** Exposed so the prompt can reflect the dictation state, for example in its placeholder. */
const state = defineModel<'idle' | 'recording' | 'transcribing'>('state', { default: 'idle' })
/** Transcript of what was said so far, refreshed while recording. */
const preview = defineModel<string>('preview', { default: '' })

const toast = useToast()
const { loggedIn } = useUserSession()
const { supported, recording, finalizing, level, transcript, error, start, stop, cancel } = useDictation()

// Rolling input levels rendered as a small waveform while recording
const BARS = 14
const bars = ref<number[]>(Array.from({ length: BARS }, () => 0))
let sampler: ReturnType<typeof setInterval> | undefined

watch(recording, (value) => {
  clearInterval(sampler)
  if (value) {
    bars.value = Array.from({ length: BARS }, () => 0)
    sampler = setInterval(() => {
      bars.value = [...bars.value.slice(1), level.value]
    }, 80)
  }
})

watch([recording, finalizing], ([isRecording, isFinalizing]) => {
  state.value = isRecording ? 'recording' : isFinalizing ? 'transcribing' : 'idle'
})

watch(transcript, (value) => {
  preview.value = value
})

watch(error, (value) => {
  if (value) fail(value)
})

const tooltip = computed(() => {
  if (!supported.value) return 'Dictation is not supported in this browser'
  if (!loggedIn.value) return 'You need to be logged in to dictate'
  return 'Dictate'
})

function fail(cause: Error) {
  toast.add({
    title: 'Dictation failed',
    description: cause.message,
    icon: 'i-lucide-alert-circle',
    color: 'error'
  })
}

async function record() {
  try {
    await start({ onMaxDuration: finish })
  } catch (cause) {
    fail(cause as Error)
  }
}

async function finish() {
  try {
    const text = await stop()
    if (text) {
      emit('transcript', text)
    }
  } catch (cause) {
    fail(cause as Error)
  }
}

onBeforeUnmount(() => {
  clearInterval(sampler)
  // The prompt swaps this button out when text is typed, do not leave it thinking we are still recording
  state.value = 'idle'
  preview.value = ''
})
</script>

<template>
  <div class="flex items-center gap-1">
    <template v-if="recording || finalizing">
      <div
        v-if="recording"
        class="flex items-center gap-0.75 h-7 px-2"
        aria-hidden="true"
      >
        <span
          v-for="(bar, index) in bars"
          :key="index"
          class="w-0.5 rounded-full bg-inverted/80 transition-[height] duration-75"
          :style="{ height: `${Math.max(2, Math.round(bar * 18))}px` }"
        />
      </div>

      <UButton
        v-if="recording"
        icon="i-lucide-x"
        color="neutral"
        variant="subtle"
        size="sm"
        aria-label="Cancel dictation"
        @click="cancel()"
      />
      <UButton
        icon="i-lucide-check"
        color="neutral"
        size="sm"
        :loading="finalizing"
        aria-label="Finish dictation"
        @click="finish"
      />
    </template>

    <UTooltip
      v-else
      :text="tooltip"
      :content="{ side: 'top' }"
    >
      <UButton
        icon="i-lucide-mic"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="disabled || !loggedIn || !supported"
        aria-label="Dictate"
        @click="record"
      />
    </UTooltip>
  </div>
</template>
