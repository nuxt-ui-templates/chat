<script setup lang="ts">
import { LazyModalConfirm } from '#components'
import type { Chat } from '~~/shared/types/db'

const route = useRoute()
const toast = useToast()
const overlay = useOverlay()
const colorMode = useColorMode()
const { loggedIn, openInPopup } = useUserSession()

const isHistoryOpen = ref(false)
const searchOpen = ref(false)

const deleteModal = overlay.create(LazyModalConfirm, {
  props: {
    title: 'Delete chat',
    description: 'Are you sure you want to delete this chat? This cannot be undone.'
  }
})

const { data: chats, refresh: refreshChats } = await useFetch('/api/chats', {
  key: 'chats',
  transform: (data: Chat[]) => data.map(chat => ({
    id: chat.id,
    label: chat.title || 'Untitled',
    to: `/chat/${chat.id}`,
    icon: 'i-lucide-message-circle',
    createdAt: chat.createdAt
  }))
})

onNuxtReady(async () => {
  const first10 = (chats.value || []).slice(0, 10)
  for (const chat of first10) {
    await $fetch(`/api/chats/${chat.id}`)
  }
})

watch(loggedIn, () => {
  refreshChats()
})

const { groups } = useChats(chats)

async function deleteChat(id: string) {
  const instance = deleteModal.open()
  const result = await instance.result
  if (!result) {
    return
  }

  await $fetch(`/api/chats/${id}`, { method: 'DELETE' })

  toast.add({
    title: 'Chat deleted',
    description: 'Your chat has been deleted',
    icon: 'i-lucide-trash'
  })

  refreshChats()

  if (route.params.id === id) {
    navigateTo('/')
  }
}

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

defineShortcuts({
  c: () => {
    navigateTo('/')
  },
  k: () => {
    searchOpen.value = true
  }
})
</script>

<template>
  <UDashboardGroup unit="rem" class="h-screen overflow-hidden flex flex-row">
    <!-- Custom Sidebar (Icons) -->
    <aside class="w-[72px] flex flex-col items-center py-6 border-r border-gray-200 dark:border-gray-800 bg-[#f9f9f9] dark:bg-[#222222] transition-colors duration-200 z-30 shrink-0">
      <div class="flex flex-col gap-6 w-full items-center">
        <!-- Toggle History/Dashboard -->
        <button
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
          title="Toggle Sidebar"
          @click="isHistoryOpen = !isHistoryOpen"
        >
          <span class="material-icons-outlined text-[24px]">space_dashboard</span>
        </button>
        <!-- New Chat -->
        <NuxtLink
          to="/"
          class="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity shadow-sm"
          title="New Chat"
        >
          <span class="material-icons-round text-[20px]">add</span>
        </NuxtLink>
      </div>

      <div class="flex flex-col gap-4 mt-8 w-full items-center flex-1">
        <!-- Search -->
        <button
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
          title="Search"
          @click="searchOpen = true"
        >
          <span class="material-icons-outlined text-[24px]">search</span>
        </button>

        <!-- History -->
        <button
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
          title="History"
          @click="isHistoryOpen = !isHistoryOpen"
        >
          <span class="material-icons-outlined text-[24px]">history</span>
        </button>
      </div>

      <div class="flex flex-col gap-4 w-full items-center mb-2">
        <button
          class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
          title="Toggle Theme"
          @click="toggleTheme"
        >
          <span class="material-icons-outlined text-[24px]">{{ colorMode.value === 'dark' ? 'dark_mode' : 'light_mode' }}</span>
        </button>
      </div>
    </aside>

    <!-- History Panel (Collapsible) -->
    <div
      class="flex flex-col h-full bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out overflow-hidden z-20 shrink-0"
      :class="isHistoryOpen ? 'w-80 opacity-100' : 'w-0 opacity-0'"
    >
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between min-w-[320px]">
        <h3 class="font-bold text-lg whitespace-nowrap">
          History
        </h3>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          @click="isHistoryOpen = false"
        />
      </div>
      <div class="flex-1 overflow-y-auto p-4 min-w-[320px]">
        <template v-if="loggedIn">
          <div v-for="group in groups" :key="group.id" class="mb-4">
            <div v-if="group.items.length" class="mb-2">
              <div class="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                {{ group.label }}
              </div>
              <div class="space-y-1 mt-1">
                <div
                  v-for="chat in group.items"
                  :key="chat.id"
                  class="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm cursor-pointer relative"
                >
                  <NuxtLink :to="chat.to" class="flex-1 truncate" active-class="text-primary-500 font-medium">
                    {{ chat.label }}
                  </NuxtLink>
                  <UButton
                    icon="i-lucide-trash"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click.stop="deleteChat(chat.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col items-center justify-center h-full gap-4 mt-10">
            <p class="text-sm text-gray-500 text-center">
              Login to save your chat history
            </p>
            <UButton
              label="Login with GitHub"
              icon="i-simple-icons-github"
              color="neutral"
              variant="outline"
              @click="openInPopup('/auth/github')"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Main -->
    <div class="flex-1 relative flex flex-col h-full overflow-hidden min-w-0">
      <!-- Header -->
      <header class="absolute top-0 right-0 p-6 flex items-center gap-4 z-10 pointer-events-none">
        <div class="pointer-events-auto flex items-center gap-4">
          <UserMenu v-if="loggedIn" :collapsed="true" />
          <UButton
            v-else
            label="Login"
            color="neutral"
            variant="ghost"
            @click="openInPopup('/auth/github')"
          />

          <button class="bg-gray-900 dark:bg-white text-white dark:text-black px-5 py-2 rounded-full font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm cursor-pointer">
            Get Pro
          </button>
        </div>
      </header>

      <slot />
    </div>

    <!-- Search -->
    <UDashboardSearch
      v-model="searchOpen"
      :groups="[{ id: 'links', items: [{ label: 'New chat', to: '/', icon: 'i-lucide-square-pen' }] }, ...groups]"
    />
  </UDashboardGroup>
</template>
