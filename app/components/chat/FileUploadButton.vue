<script setup lang="ts">
const { loggedIn } = useUserSession()

defineProps<{
  open: () => void
}>()
</script>

<template>
  <UTooltip
    :content="{
      side: 'top'
    }"
    :text="!loggedIn ? 'You need to be logged in to upload files' : ''"
  >
    <UButton
      icon="i-lucide-paperclip"
      color="neutral"
      variant="ghost"
      size="sm"
      :disabled="!loggedIn"
      aria-label="Attach file"
      @click="open()"
    />
  </UTooltip>
</template>
