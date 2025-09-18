<script setup lang="ts">
defineProps<{
  show: boolean
}>()
</script>

<template>
  <div
    v-if="show"
    class="absolute inset-0 m-4 z-50 bg-radial from-primary/10 from-10% to-primary/20 border-2 border-primary/30 rounded-lg flex items-center justify-center backdrop-blur-lg pointer-events-none"
  >
    <div class="text-center">
      <UIcon name="i-lucide-upload" class="size-12 mb-4" />
      <p class="text-lg font-medium">
        Drop your files here
      </p>
      <p class="text-sm text-muted">
        Supported formats: Images and PDFs
      </p>
    </div>
  </div>
</template>
