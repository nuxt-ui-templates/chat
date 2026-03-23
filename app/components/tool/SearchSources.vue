<script setup lang="ts">
interface SearchSource {
  url: string
  title?: string
}

const props = defineProps<{
  sources: SearchSource[]
}>()

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function getFaviconUrl(url: string): string {
  return `https://www.google.com/s2/favicons?sz=32&domain=${getDomain(url)}`
}
</script>

<template>
  <div v-if="props.sources.length" class="p-1 border border-default rounded-md max-h-40 overflow-y-auto">
    <a
      v-for="source in props.sources"
      :key="source.url"
      :href="source.url"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2 px-2 py-1 text-sm text-muted hover:text-default hover:bg-elevated/50 transition-colors min-w-0 rounded-md"
    >
      <img
        :src="getFaviconUrl(source.url)"
        :alt="getDomain(source.url)"
        class="size-4 shrink-0 rounded-sm"
        loading="lazy"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      >
      <span class="truncate">{{ source.title || getDomain(source.url) }}</span>
      <span v-if="source.title" class="text-xs text-dimmed ms-auto shrink-0">{{ getDomain(source.url) }}</span>
    </a>
  </div>
</template>
