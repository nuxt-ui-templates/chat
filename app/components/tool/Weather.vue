<script setup lang="ts">
defineProps<{
  invocation: WeatherUIToolInvocation
}>()
</script>

<template>
  <div v-if="invocation.state === 'output-available'">
    Weather in {{ invocation.output.location }} is {{ invocation.output.temperature }}°F
  </div>
  <div v-else-if="invocation.state === 'input-streaming'">
    Streaming...
  </div>
  <div v-else-if="invocation.state === 'input-available'">
    Input available...
  </div>
  <div v-else-if="invocation.state === 'output-error'">
    Error: {{ invocation.errorText }}
  </div>
</template>
