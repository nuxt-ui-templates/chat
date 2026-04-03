<script setup lang="ts">
import type { AvatarProps } from '@nuxt/ui'
import { AnimatePresence, Motion } from 'motion-v'

interface ChatFilePreviewProps {
  name: string
  type: string
  previewUrl?: string
  size?: AvatarProps['size']
  status?: 'idle' | 'uploading' | 'uploaded' | 'error'
  error?: string
  removable?: boolean
}

const props = withDefaults(defineProps<ChatFilePreviewProps>(), {
  status: 'idle',
  removable: false,
  size: '2xl'
})

const emit = defineEmits<{
  remove: []
}>()

const open = ref(false)

const isZoomable = computed(() => props.type.startsWith('image/') && props.previewUrl)

function openZoom() {
  if (isZoomable.value) {
    open.value = true
  }
}

function closeZoom() {
  open.value = false
}

defineShortcuts({
  escape: closeZoom
})

onMounted(() => {
  window.addEventListener('scroll', closeZoom, true)
})

onUnmounted(() => {
  window.removeEventListener('scroll', closeZoom, true)
})
</script>

<template>
  <div class="relative group">
    <UTooltip :text="removeRandomSuffix(name)">
      <UAvatar
        :size="size"
        :src="type.startsWith('image/') ? previewUrl : undefined"
        :icon="getFileIcon(type, name)"
        class="rounded-lg"
        :class="{
          'opacity-50': status === 'uploading',
          'cursor-zoom-in': isZoomable
        }"
        @click="openZoom"
      />
    </UTooltip>

    <div
      v-if="status === 'uploading'"
      class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
    >
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-white" />
    </div>

    <UTooltip v-if="status === 'error'" :text="error">
      <div class="absolute inset-0 flex items-center justify-center bg-error/50 rounded-lg">
        <UIcon name="i-lucide-alert-circle" class="size-6 text-white" />
      </div>
    </UTooltip>

    <UButton
      v-if="removable && status !== 'uploading'"
      icon="i-lucide-x"
      size="xs"
      color="neutral"
      class="absolute p-0 -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full ring ring-bg"
      aria-label="Remove file"
      @click="emit('remove')"
    />

    <Teleport to="body">
      <AnimatePresence>
        <div v-if="open" class="fixed inset-0 z-50">
          <Motion
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            class="absolute inset-0 bg-default/75 backdrop-blur-sm"
          />

          <Motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.9 }"
            :transition="{ type: 'spring', bounce: 0.15, duration: 0.5, ease: 'easeInOut' }"
            class="absolute inset-0 flex items-center justify-center cursor-zoom-out"
            @click="closeZoom"
          >
            <img
              :src="previewUrl"
              :alt="removeRandomSuffix(name)"
              class="max-w-[95vw] max-h-[95vh] object-contain rounded-md"
            >
          </Motion>
        </div>
      </AnimatePresence>
    </Teleport>
  </div>
</template>
