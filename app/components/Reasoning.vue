<script setup lang="ts">
import type { ReasoningUIPart } from 'ai'

const { invocation, isStreaming } = defineProps<{
  invocation: ReasoningUIPart
  isStreaming: boolean
}>()

const open = ref(false)

watch(() => isStreaming, () => {
  open.value = isStreaming
}, { immediate: true })
</script>

<template>
  <UCollapsible v-model:open="open" unmount-on-hide>
    <UButton
      class="px-0 group"
      color="neutral"
      variant="link"
      :loading="isStreaming"
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
      }"
      :label="isStreaming ? 'Thinking...' : 'Thoughts'"
    />

    <template #content>
      <div class="border-l-2 border-default pl-4 text-sm text-muted mt-2 space-y-2">
        <span v-for="(value, index) in invocation.text.split('\n')" :key="index">
          {{ value }}
        </span>
      </div>
    </template>
  </UCollapsible>
</template>
