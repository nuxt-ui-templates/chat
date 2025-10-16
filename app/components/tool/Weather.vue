<script setup lang="ts">
defineProps<{
  invocation: WeatherUIToolInvocation
}>()
</script>

<template>
  <div v-if="invocation.state === 'output-available'" class="w-full max-w-[480px] bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl px-5 py-4 text-highlighted shadow dark:shadow-lg">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-baseline gap-1">
        <span class="text-4xl font-light">{{ invocation.output.temperature }}°</span>
        <span class="text-base text-highlighted/80 mt-1">C</span>
      </div>
      <div class="text-right">
        <div class="text-base font-medium mb-1">
          {{ invocation.output.location }}
        </div>
        <div class="text-xs text-highlighted/70">
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
        <div class="text-xs text-highlighted/70 font-medium">
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
          <div class="text-highlighted/60">
            {{ forecast.low }}°
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center py-3">
      <div class="text-xs text-highlighted/70">
        No forecast available
      </div>
    </div>
  </div>

  <div v-else-if="invocation.state === 'input-available'" class="w-full max-w-[480px] bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl px-5 py-4 text-highlighted shadow dark:shadow-lg">
    <div class="flex items-center justify-center py-6">
      <div class="text-center">
        <UIcon
          name="i-lucide-cloud-sun"
          class="size-8 text-white mx-auto mb-2"
        />
        <div class="text-sm">
          Loading weather data...
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="invocation.state === 'output-error'" class="w-full max-w-[480px] bg-gradient-to-br from-red-500 to-red-700 rounded-xl px-5 py-4 text-highlighted shadow dark:shadow-lg">
    <div class="flex items-center justify-center py-6">
      <div class="text-center">
        <UIcon
          name="i-lucide-alert-triangle"
          class="size-8 text-white mx-auto mb-2"
        />
        <div class="text-sm">
          Can't get weather data, please try again later
        </div>
      </div>
    </div>
  </div>

  <div v-else class="w-full max-w-[480px] bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl px-5 py-4 text-highlighted shadow dark:shadow-lg">
    <div class="flex items-center justify-center py-6">
      <div class="text-center">
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 text-white mx-auto mb-2 animate-spin"
        />
        <div class="text-sm">
          Getting weather...
        </div>
      </div>
    </div>
  </div>
</template>
