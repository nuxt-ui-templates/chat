<script setup lang="ts">
const props = defineProps<{
  invocation: ChartUIToolInvocation
}>()

const color = computed(() => {
  return ({
    'output-error': 'bg-muted text-error'
  })[props.invocation.state as string] || 'bg-muted text-white'
})

const icon = computed(() => {
  return ({
    'input-available': 'i-lucide-line-chart',
    'output-error': 'i-lucide-triangle-alert'
  })[props.invocation.state as string] || 'i-lucide-loader-circle'
})

const message = computed(() => {
  return ({
    'input-available': 'Generating chart...',
    'output-error': 'Can\'t generate chart, please try again'
  })[props.invocation.state as string] || 'Loading chart data...'
})

const categories = computed(() => props.invocation.output?.series.map(serie => ({
  key: serie.key,
  label: serie.name,
  color: serie.color
})) ?? [])
</script>

<template>
  <div v-if="invocation.state === 'output-available'" class="my-5">
    <div v-if="invocation.output.title" class="flex items-center gap-2 mb-2">
      <UIcon name="i-lucide-line-chart" class="size-5 text-primary shrink-0" />
      <div class="min-w-0">
        <h3 class="text-lg font-semibold truncate">
          {{ invocation.output.title }}
        </h3>
      </div>
    </div>

    <div class="relative">
      <div class="dot-pattern inset-0" />

      <UChart
        :data="invocation.output.data"
        :index="invocation.output.xKey"
        :categories="categories"
        :x-label="invocation.output.xLabel"
        :y-label="invocation.output.yLabel"
        curve="monotone"
        legend
        :height="300"
        :aria-label="invocation.output.title"
      />
    </div>
  </div>

  <div v-else class="rounded-xl px-5 py-4 my-5" :class="color">
    <div class="flex items-center justify-center h-44">
      <div class="text-center">
        <UIcon
          :name="icon"
          class="size-8 mx-auto mb-2"
          :class="[invocation.state === 'input-streaming' && 'animate-spin']"
        />
        <div class="text-sm">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --dot-pattern-color: #111827;
}

.dark {
  --dot-pattern-color: #9ca3af;
}

.dot-pattern {
  position: absolute;
  background-image: radial-gradient(var(--dot-pattern-color) 1px, transparent 1px);
  background-size: 7px 7px;
  background-position: -8.5px -8.5px;
  opacity: 20%;
  mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1), transparent 75%);
}
</style>
