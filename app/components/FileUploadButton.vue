<script setup lang="ts">
const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

const inputId = useId()

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])

  if (files.length > 0) {
    emit('filesSelected', files)
  }

  input.value = ''
}
</script>

<template>
  <label :for="inputId" class="cursor-pointer">
    <UButton
      icon="i-lucide-paperclip"
      variant="ghost"
      color="neutral"
      size="sm"
      as="span"
    />
  </label>
  <input
    :id="inputId"
    type="file"
    multiple
    accept="image/*,.pdf"
    class="hidden"
    @change="handleFileSelect"
  >
</template>
