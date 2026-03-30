<script setup lang="ts">
const props = defineProps<{
  invocation: WeatherUIToolInvocation
}>()

const color = computed(() => {
  return ({
    'output-available': 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 dark:from-sky-500 dark:via-blue-600 dark:to-indigo-700 text-white',
    'output-error': 'bg-muted text-error'
  })[props.invocation.state as string] || 'bg-muted text-white'
})

const icon = computed(() => {
  return ({
    'input-available': 'i-lucide-cloud-sun',
    'output-error': 'i-lucide-triangle-alert'
  })[props.invocation.state as string] || 'i-lucide-loader-circle'
})

const message = computed(() => {
  return ({
    'input-available': 'Loading weather data...',
    'output-error': 'Can\'t get weather data, please try again later'
  })[props.invocation.state as string] || 'Loading weather data...'
})
</script>

<template>
  <div class="rounded-xl px-5 py-4 my-5" :class="color">
    <template v-if="invocation.state === 'output-available'">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-baseline">
          <span class="text-4xl font-bold">{{ invocation.output.temperature }}°</span>
          <span class="text-base text-white/80">C</span>
        </div>
        <div class="text-right">
          <div class="text-base font-medium mb-1">
            {{ invocation.output.location }}
          </div>
          <div class="text-xs text-white/70">
            H:{{ invocation.output.temperatureHigh }}° L:{{ invocation.output.temperatureLow }}°
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <UIcon
            :name="invocation.output.condition.icon"
            class="size-6 text-white"
          />
          <div class="text-sm font-medium">
            {{ invocation.output.condition.text }}
          </div>
        </div>

        <div class="flex gap-3 text-xs">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-droplets" class="size-3 text-blue-200" />
            <span>{{ invocation.output.humidity }}%</span>
          </div>
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-wind" class="size-3 text-blue-200" />
            <span>{{ invocation.output.windSpeed }} km/h</span>
          </div>
        </div>
      </div>

      <div v-if="invocation.output.dailyForecast.length > 0" class="flex items-center justify-between">
        <div
          v-for="(forecast, index) in invocation.output.dailyForecast"
          :key="index"
          class="flex flex-col items-center gap-1.5"
        >
          <div class="text-xs text-white/70 font-medium">
            {{ forecast.day }}
          </div>

          <UIcon
            :name="forecast.condition.icon"
            class="size-5 text-white"
          />
          <div class="text-xs font-medium">
            <div>
              {{ forecast.high }}°
            </div>
            <div class="text-white/60">
              {{ forecast.low }}°
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-center py-3">
        <div class="text-xs">
          No forecast available
        </div>
      </div>
    </template>

    <div v-else class="flex items-center justify-center h-44">
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
