<script setup lang="ts">
const input = ref('')
const loading = ref(false)

const { model } = useModels()

const files = ref<File[]>([])
const {
  dropZoneRef,
  isOverDropZone,
  convertFilesToDataURLs,
  clearFiles
} = useChatFileUpload(files)

async function createChat(prompt: string, files?: File[]) {
  input.value = prompt
  loading.value = true

  const parts: Array<{ type: string, text?: string, mediaType?: string, url?: string }> = [{ type: 'text', text: prompt }]

  if (files && files.length > 0) {
    const filesData = await convertFilesToDataURLs(files)
    parts.push(...filesData)
  }

  const chat = await $fetch('/api/chats', {
    method: 'POST',
    body: {
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
  await createChat(input.value, files.value)
  clearFiles()
}

const quickChats = [
  {
    label: 'Why use Nuxt UI?',
    icon: 'i-logos-nuxt-icon'
  },
  {
    label: 'Help me create a Vue composable',
    icon: 'i-logos-vue'
  },
  {
    label: 'Tell me more about UnJS',
    icon: 'i-logos-unjs'
  },
  {
    label: 'Why should I consider VueUse?',
    icon: 'i-logos-vueuse'
  },
  {
    label: 'Tailwind CSS best practices',
    icon: 'i-logos-tailwindcss-icon'
  },
  {
    label: 'What is the weather in Bordeaux?',
    icon: 'i-lucide-sun'
  },
  {
    label: 'Generate an image of a cat',
    icon: 'i-lucide-image'
  }
]
</script>

<template>
  <UDashboardPanel
    id="home"
    class="relative"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <DragDropOverlay :show="isOverDropZone" />
      <UContainer ref="dropZoneRef" class="flex-1 flex flex-col justify-center gap-4 sm:gap-6 py-8">
        <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">
          How can I help you today?
        </h1>
        <UChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          class="[view-transition-name:chat-prompt]"
          variant="subtle"
          @submit="onSubmit"
        >
          <UChatPromptSubmit color="neutral" />

          <template v-if="files.length > 0" #header>
            <FilePreview v-model="files" />
          </template>

          <template #footer>
            <div class="flex items-center gap-2">
              <FileUploadButton @files-selected="files.push(...$event)" />
              <ModelSelect v-model="model" />
            </div>
          </template>
        </UChatPrompt>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="quickChat in quickChats"
            :key="quickChat.label"
            :icon="quickChat.icon"
            :label="quickChat.label"
            size="sm"
            color="neutral"
            variant="outline"
            class="rounded-full"
            @click="createChat(quickChat.label)"
          />
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
