<script setup lang="ts">
const files = defineModel<FileWithStatus[]>({ required: true })

const emit = defineEmits<{
  remove: [id: string]
}>()

function removeFile(id: string) {
  emit('remove', id)
}
</script>

<template>
  <div v-if="files.length > 0" class="flex flex-wrap gap-2">
    <FileAvatar
      v-for="fileWithStatus in files"
      :key="fileWithStatus.id"
      :name="fileWithStatus.file.name"
      :type="fileWithStatus.file.type"
      :preview-url="fileWithStatus.previewUrl"
      :status="fileWithStatus.status"
      :error="fileWithStatus.error"
      removable
      @remove="removeFile(fileWithStatus.id)"
    />
  </div>
</template>
