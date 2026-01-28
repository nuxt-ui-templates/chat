<script setup lang="ts">
const input = ref('')
const loading = ref(false)
const chatId = crypto.randomUUID()

const {
  dropzoneRef,
  isDragging,
  files,
  isUploading,
  uploadedFiles,
  addFiles,
  removeFile,
  clearFiles
} = useFileUploadWithStatus(chatId)

async function createChat(prompt: string) {
  input.value = prompt
  loading.value = true

  const parts: Array<{ type: string, text?: string, mediaType?: string, url?: string }> = [{ type: 'text', text: prompt }]

  if (uploadedFiles.value.length > 0) {
    parts.push(...uploadedFiles.value)
  }

  const chat = await $fetch('/api/chats', {
    method: 'POST',
    body: {
      id: chatId,
      message: {
        role: 'user',
        parts
      }
    }
  })

  refreshNuxtData('chats')
  navigateTo(`/chat/${chat?.id}`)
}

async function onSubmit() {
  await createChat(input.value)
  clearFiles()
}
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center w-full h-full relative p-4">
    <DragDropOverlay :show="isDragging" />

    <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center">
      <h1 class="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-10 tracking-tight text-center">
        What can I help with?
      </h1>

      <div ref="dropzoneRef" class="w-full max-w-2xl relative group">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-500 pointer-events-none" />

        <SelamInput
          v-model="input"
          :disabled="isUploading"
          :loading="loading"
          @submit="onSubmit"
          @files-selected="addFiles"
        >
          <template #files>
            <div v-if="files.length > 0" class="flex flex-wrap gap-2 mb-2">
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
        </SelamInput>
      </div>

      <div class="mt-8 flex flex-col items-center gap-4 w-full max-w-2xl px-4 text-center">
        <div class="bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50">
          <p class="font-medium">
            You've hit the Free plan limit for Crawl-4o. Subscribe to Pro plan to increase limits.
          </p>
          <p class="mt-1 opacity-80">
            Responses will use another model until your limit resets after 6:35 PM.
          </p>
        </div>
        <p class="text-[11px] text-gray-400 dark:text-gray-600">
          AI can make mistakes. Please double-check responses.
        </p>
      </div>
    </div>
  </div>
</template>
