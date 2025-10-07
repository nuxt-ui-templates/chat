<script setup lang="ts">
const files = defineModel<FileWithStatus[]>({ required: true })

const emit = defineEmits<{
  remove: [id: string]
}>()

function getFileIcon(file: File): string {
  if (file.type.startsWith('image/')) {
    return 'i-lucide-image'
  }
  if (file.type === 'application/pdf') {
    return 'i-lucide-file-text'
  }
  return 'i-lucide-file'
}

function removeFile(id: string) {
  emit('remove', id)
}
</script>

<template>
  <div v-if="files.length > 0" class="flex flex-wrap gap-2">
    <div
      v-for="fileWithStatus in files"
      :key="fileWithStatus.id"
      class="relative group"
    >
      <UAvatar
        size="3xl"
        :src="fileWithStatus.file.type.startsWith('image/') ? fileWithStatus.previewUrl : undefined"
        :icon="getFileIcon(fileWithStatus.file)"
        class="border-2 border-default rounded-lg"
        :class="{
          'opacity-50': fileWithStatus.status === 'uploading',
          'border-error': fileWithStatus.status === 'error'
        }"
      />

      <div
        v-if="fileWithStatus.status === 'uploading'"
        class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
      >
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-white" />
      </div>

      <div
        v-if="fileWithStatus.status === 'error'"
        class="absolute inset-0 flex items-center justify-center bg-error/50 rounded-lg"
        :title="fileWithStatus.error"
      >
        <UIcon name="i-lucide-alert-circle" class="size-8 text-white" />
      </div>

      <UButton
        v-if="fileWithStatus.status !== 'uploading'"
        icon="i-lucide-x"
        size="xs"
        square
        color="neutral"
        variant="solid"
        class="absolute p-0 -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        @click="removeFile(fileWithStatus.id)"
      />
    </div>
  </div>
</template>
