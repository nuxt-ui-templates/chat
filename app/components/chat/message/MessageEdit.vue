<script setup lang="ts">
import type { UIMessage } from 'ai'

const props = defineProps<{
  message: UIMessage
  text: string
}>()

const emit = defineEmits<{
  save: [message: UIMessage, text: string]
  cancel: []
}>()

const editingText = ref(props.text)
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <UTextarea
      v-model="editingText"
      autofocus
      autoresize
      :rows="1"
      size="xl"
      variant="none"
      :ui="{ base: 'p-0' }"
    />

    <div class="flex gap-1.5 justify-end">
      <UButton
        size="sm"
        variant="soft"
        color="neutral"
        label="Cancel"
        @click="emit('cancel')"
      />
      <UButton
        size="sm"
        label="Save"
        :disabled="!editingText.trim() || editingText === text"
        @click="emit('save', message, editingText)"
      />
    </div>
  </div>
</template>
