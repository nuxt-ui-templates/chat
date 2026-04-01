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
      autoresize
      :rows="1"
      autofocus
    />

    <div class="flex gap-1.5 justify-end">
      <UButton
        size="sm"
        variant="ghost"
        color="neutral"
        label="Cancel"
        @click="emit('cancel')"
      />
      <UButton
        size="sm"
        label="Save"
        :disabled="!editingText.trim()"
        @click="emit('save', message, editingText)"
      />
    </div>
  </div>
</template>
