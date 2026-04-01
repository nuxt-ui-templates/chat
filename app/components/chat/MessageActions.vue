<script setup lang="ts">
import type { UIMessage } from 'ai'
import { useClipboard } from '@vueuse/core'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'

const props = defineProps<{
  message: UIMessage
  isStreaming: boolean
  isEditing: boolean
  vote: boolean | null
}>()

const emit = defineEmits<{
  edit: [message: UIMessage]
  regenerate: [message: UIMessage]
  vote: [message: UIMessage, isUpvoted: boolean]
}>()

const clipboard = useClipboard()

const copied = ref(false)

function copy() {
  clipboard.copy(getTextFromMessage(props.message))

  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <template v-if="message.role === 'assistant' && !isStreaming">
    <UTooltip text="Good response">
      <UButton
        size="sm"
        :color="vote === true ? 'success' : 'neutral'"
        variant="ghost"
        icon="i-lucide-thumbs-up"
        @click="emit('vote', message, true)"
      />
    </UTooltip>

    <UTooltip text="Bad response">
      <UButton
        size="sm"
        :color="vote === false ? 'error' : 'neutral'"
        variant="ghost"
        icon="i-lucide-thumbs-down"
        @click="emit('vote', message, false)"
      />
    </UTooltip>

    <UTooltip text="Copy response">
      <UButton
        size="sm"
        :color="copied ? 'primary' : 'neutral'"
        variant="ghost"
        :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
        @click="copy"
      />
    </UTooltip>

    <UTooltip text="Regenerate response">
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-rotate-cw"
        @click="emit('regenerate', message)"
      />
    </UTooltip>
  </template>

  <template v-if="message.role === 'user' && !isStreaming && !isEditing">
    <UTooltip text="Edit message">
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-pencil"
        @click="emit('edit', message)"
      />
    </UTooltip>
  </template>
</template>
