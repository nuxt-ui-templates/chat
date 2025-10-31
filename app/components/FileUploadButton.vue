<script setup lang="ts">
const { loggedIn } = useUserSession()

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
  <UTooltip
    :content="{
      side: 'top'
    }"
    :text="!loggedIn ? 'You need to be logged in to upload files' : ''"
  >
    <label :for="inputId" :class="{ 'cursor-not-allowed opacity-50': !loggedIn }">
      <UButton
        icon="i-lucide-paperclip"
        variant="ghost"
        color="neutral"
        size="sm"
        as="span"
        :disabled="!loggedIn"
      />
    </label>
    <input
      :id="inputId"
      type="file"
      multiple
      :accept="FILE_UPLOAD_CONFIG.acceptPattern"
      class="hidden"
      :disabled="!loggedIn"
      @change="handleFileSelect"
    >
  </UTooltip>
</template>
