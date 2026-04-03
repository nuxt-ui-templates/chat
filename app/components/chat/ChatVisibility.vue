<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  chatId: string
  visibility: 'public' | 'private'
}>()

const emit = defineEmits<{
  'update:visibility': [visibility: 'public' | 'private']
}>()

const toast = useToast()
const { csrf, headerName } = useCsrf()
const clipboard = useClipboard()

const loading = ref(false)

const isShared = computed(() => props.visibility === 'public')
const shareUrl = computed(() => `${window.location.origin}/chat/${props.chatId}`)

const options = [
  {
    value: 'private' as const,
    label: 'Keep private',
    description: 'Only you have access',
    icon: 'i-lucide-lock'
  },
  {
    value: 'public' as const,
    label: 'Shared',
    description: 'Anyone with the link can view',
    icon: 'i-lucide-globe'
  }
]

async function updateVisibility(value: 'public' | 'private') {
  if (value === props.visibility) return

  loading.value = true
  const previous = props.visibility
  emit('update:visibility', value)

  try {
    await $fetch(`/api/chats/${props.chatId}/visibility`, {
      method: 'PATCH',
      headers: { [headerName]: csrf },
      body: { visibility: value }
    })
  } catch {
    emit('update:visibility', previous)
    toast.add({
      description: 'Failed to update visibility',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const copied = ref(false)

function copyLink() {
  clipboard.copy(shareUrl.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <UModal
    :title="isShared ? 'Chat shared' : 'Share chat'"
    :description="isShared ? 'Anyone with the link can view this chat.' : 'Choose who can view this chat.'"
    close
  >
    <UTooltip text="Share chat">
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-share"
        aria-label="Share chat"
      />
    </UTooltip>

    <template #body>
      <div class="flex flex-col gap-0.5 rounded-lg ring ring-default p-1">
        <button
          v-for="option in options"
          :key="option.value"
          :disabled="loading"
          :data-selected="option.value === visibility"
          class="flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-elevated/50 disabled:opacity-50 data-[selected=true]:bg-elevated/50"
          @click="updateVisibility(option.value)"
        >
          <UIcon :name="option.icon" class="size-5 text-muted shrink-0" />

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-highlighted">
              {{ option.label }}
            </p>
            <p class="text-sm text-muted">
              {{ option.description }}
            </p>
          </div>

          <UIcon
            v-if="visibility === option.value"
            name="i-lucide-circle-check"
            class="size-5 text-primary shrink-0"
          />
        </button>
      </div>

      <div v-if="isShared" class="flex items-center gap-2 rounded-lg ring ring-default px-2 py-1.5 mt-4">
        <a :href="shareUrl" target="_blank" class="flex-1 truncate text-sm text-muted pl-1">
          {{ shareUrl }}
        </a>

        <UButton
          :label="copied ? 'Copied!' : 'Copy link'"
          size="sm"
          color="neutral"
          :variant="copied ? 'soft' : 'solid'"
          class="min-w-[72px] justify-center"
          @click="copyLink"
        />
      </div>
    </template>
  </UModal>
</template>
