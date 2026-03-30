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

const xFormatter = (invocation: ChartUIToolInvocation) => {
  return (tick: number, _i?: number, _ticks?: number[]): string => {
    if (!invocation.output?.data[tick]) return ''
    return String(invocation.output.data[tick][invocation.output.xKey] ?? '')
  }
}

const categories = (invocation: ChartUIToolInvocation): Record<string, BulletLegendItemInterface> => {
  if (!invocation.output?.series) return {}
  return invocation.output.series.reduce((acc: Record<string, BulletLegendItemInterface>, serie: { key: string, name: string, color: string }) => {
    acc[serie.key] = {
      name: serie.name,
      color: serie.color
    }
    return acc
  }, {} as Record<string, BulletLegendItemInterface>)
}

const formatValue = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return 'N/A'
  if (typeof value === 'string') return value

  if (Number.isInteger(value)) {
    return value.toLocaleString()
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}
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

    <div class="relative overflow-hidden">
      <div class="dot-pattern h-full -top-5 left-0 right-0" />

      <LineChart
        :height="300"
        :data="invocation.output.data"
        :categories="categories(invocation)"
        :x-formatter="xFormatter(invocation)"
        :x-label="invocation.output.xLabel"
        :y-label="invocation.output.yLabel"
        :y-grid-line="true"
        :curve-type="CurveType.MonotoneX"
        :legend-position="LegendPosition.Top"
        :hide-legend="false"
        :x-num-ticks="Math.min(6, invocation.output.data.length)"
        :y-num-ticks="5"
        :show-tooltip="true"
      >
        <template #tooltip="{ values }">
          <div class="bg-muted/50 rounded-sm px-2 py-1 shadow-lg backdrop-blur-sm max-w-xs ring ring-offset-2 ring-offset-(--ui-bg) ring-default border border-default">
            <div v-if="values && values[invocation.output.xKey]" class="text-sm font-semibold text-highlighted mb-2">
              {{ values[invocation.output.xKey] }}
            </div>
            <div class="space-y-1.5">
              <div
                v-for="serie in invocation.output.series"
                :key="serie.key"
                class="flex items-center justify-between gap-3"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="size-2.5 rounded-full shrink-0"
                    :style="{ backgroundColor: serie.color }"
                  />
                  <span class="text-sm text-muted truncate">{{ serie.name }}</span>
                </div>
                <span class="text-sm font-semibold text-highlighted shrink-0">
                  {{ formatValue(values?.[serie.key]) }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </LineChart>
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
  --vis-tooltip-padding: 0 !important;
  --vis-tooltip-background-color: transparent !important;
  --vis-tooltip-border-color: transparent !important;

  --vis-axis-grid-color: rgba(255, 255, 255, 0) !important;
  --vis-axis-tick-label-color: var(--ui-text-muted) !important;
  --vis-axis-label-color: var(--ui-text-toned) !important;
  --vis-legend-label-color: var(--ui-text-muted) !important;

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
