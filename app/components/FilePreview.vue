<script setup lang="ts">
const files = defineModel<File[]>({ required: true })

function createObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

function getFileIcon(file: File): string {
  if (file.type.startsWith('image/')) {
    return 'i-lucide-image'
  }
  if (file.type === 'application/pdf') {
    return 'i-lucide-file-text'
  }
  return 'i-lucide-file'
}

function removeFile(index: number) {
  const fileToRemove = files.value[index]
  if (fileToRemove) {
    URL.revokeObjectURL(createObjectUrl(fileToRemove))
    files.value.splice(index, 1)
  }
}
</script>

<template>
  <div v-if="files.length > 0" class="flex flex-wrap gap-2">
    <div
      v-for="(file, index) in files"
      :key="index"
      class="relative group"
    >
      <UAvatar
        size="3xl"
        :src="file.type.startsWith('image/') ? createObjectUrl(file) : undefined"
        :icon="getFileIcon(file)"
        class="border-2 border-default rounded-lg"
      />
      <UButton
        icon="i-lucide-x"
        size="2xs"
        color="neutral"
        variant="solid"
        class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        @click="removeFile(index)"
      />
    </div>
  </div>
</template>
