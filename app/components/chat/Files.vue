<script setup lang="ts">
defineProps<{
  files: FileWithStatus[]
}>()

defineEmits<{
  remove: [id: string]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <ChatFilePreview
      v-for="fileWithStatus in files"
      :key="fileWithStatus.id"
      :name="fileWithStatus.file.name"
      :type="fileWithStatus.file.type"
      :preview-url="fileWithStatus.previewUrl"
      :status="fileWithStatus.status"
      :error="fileWithStatus.error"
      removable
      @remove="$emit('remove', fileWithStatus.id)"
    />
  </div>
</template>
