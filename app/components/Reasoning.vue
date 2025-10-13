<script setup lang="ts">
const { isStreaming } = defineProps<{
  text: string
  isStreaming: boolean
}>()

const open = ref(false)

watch(() => isStreaming, () => {
  open.value = isStreaming
}, { immediate: true })

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/^#+\s+/gm, '') // Remove headers
}
</script>

<template>
  <UCollapsible v-model:open="open" unmount-on-hide>
    <UButton
      class="px-0 group"
      color="neutral"
      variant="link"
      size="sm"
      :loading="isStreaming"
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
      }"
      :label="isStreaming ? 'Thinking...' : 'Thoughts'"
    />

    <template #content>
      <div class="border-l-2 border-default pl-4 text-sm text-muted mt-2 space-y-2">
        <div v-for="(value, index) in cleanMarkdown(text).split('\n')" :key="index">
          <span class="whitespace-pre-wrap text-xs">{{ value }}</span>
        </div>
      </div>
    </template>
  </UCollapsible>
</template>
