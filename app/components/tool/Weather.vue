<script setup lang="ts">
const props = defineProps<{
  invocation: WeatherUIToolInvocation
}>()

// Temperature unit selection: 'C' or 'F'
const selectedUnit = ref<'C' | 'F'>('C')

// Sync with tool output unit when it becomes available
watchEffect(() => {
  const invocation = toValue(() => props.invocation)
  if (
    invocation?.state === 'output-available'
    && (invocation.output?.temperatureUnit === 'C' || invocation.output?.temperatureUnit === 'F')
  ) {
    selectedUnit.value = invocation.output.temperatureUnit
  }
})

const isCelsius = computed(() => selectedUnit.value === 'C')

const celsiusToFahrenheit = (celsius: number): number => {
  return Math.round((celsius * 9 / 5) + 32)
}

const fahrenheitToCelsius = (fahrenheit: number): number => {
  return Math.round((fahrenheit - 32) * 5 / 9)
}

const convertTemperature = (temp: number): number => {
  if (props.invocation.state !== 'output-available' || !props.invocation.output) {
    return temp
  }

  const sourceUnit = props.invocation.output.temperatureUnit
  const targetUnit = isCelsius.value ? 'C' : 'F'

  // No conversion needed if source and target are the same
  if (sourceUnit === targetUnit) {
    return temp
  }

  // Convert based on source unit
  return sourceUnit === 'C' ? celsiusToFahrenheit(temp) : fahrenheitToCelsius(temp)
}

const unitLabel = computed(() => selectedUnit.value)

// Format temperature with unit (e.g., "72°F" or "22°C")
const formatTemp = (temp: number): string => {
  return `${convertTemperature(temp)}°${unitLabel.value}`
}

// Get temperature category and styling
const temperatureCategory = computed(() => {
  if (props.invocation.state !== 'output-available' || !props.invocation.output) {
    return { icon: 'i-lucide-thermometer', color: 'text-white/70' }
  }

  const temp = convertTemperature(props.invocation.output.temperature)

  // Temperature thresholds based on selected unit
  if (isCelsius.value) {
    if (temp >= 30) return {
      icon: 'i-lucide-thermometer-sun',
      color: 'text-orange-300'
    } // Hot: 30°C+
    if (temp <= 5) return {
      icon: 'i-lucide-thermometer-snowflake',
      color: 'text-blue-300'
    } // Cold: 5°C or below
  } else {
    if (temp >= 86) return {
      icon: 'i-lucide-thermometer-sun',
      color: 'text-orange-300'
    } // Hot: 86°F+
    if (temp <= 41) return {
      icon: 'i-lucide-thermometer-snowflake',
      color: 'text-blue-300'
    } // Cold: 41°F or below
  }

  return { icon: 'i-lucide-thermometer', color: 'text-white/70' } // Moderate
})

const temperatureIcon = computed(() => temperatureCategory.value.icon)

const color = computed(() => {
  if (props.invocation.state === 'output-available' && props.invocation.output) {
    const temp = convertTemperature(props.invocation.output.temperature)

    // Hot temperature gradient
    if ((isCelsius.value && temp >= 30) || (!isCelsius.value && temp >= 86)) {
      return 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 dark:from-orange-500 dark:via-red-600 dark:to-pink-700 text-white'
    }

    // Cold temperature gradient
    if ((isCelsius.value && temp <= 5) || (!isCelsius.value && temp <= 41)) {
      return 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 dark:from-cyan-500 dark:via-blue-600 dark:to-indigo-700 text-white'
    }

    // Moderate temperature (default)
    return 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 dark:from-sky-500 dark:via-blue-600 dark:to-indigo-700 text-white'
  }

  return ({
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
      <div class="flex justify-between mb-3">
        <div class="flex">
          <span class="text-4xl font-bold">{{ convertTemperature(invocation.output.temperature) }}</span>
          <span class="text-lg text-white/60">°{{ unitLabel }}</span>
          <UIcon
            v-if="temperatureIcon !== 'i-lucide-thermometer'"
            :name="temperatureIcon"
            class="size-6 text-white/70"
          />
        </div>
        <div class="text-right">
          <div class="text-base font-medium mb-1">
            {{ invocation.output.location }}
          </div>
          <div class="text-xs text-white/70">
            H:{{ formatTemp(invocation.output.temperatureHigh) }} L:{{ formatTemp(invocation.output.temperatureLow) }}
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end mb-3">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-thermometer" class="size-4 text-white/70" />
          <URadioGroup
            v-model="selectedUnit"
            :items="[
              { value: 'C', label: '°C' },
              { value: 'F', label: '°F' }
            ]"
            orientation="horizontal"
            size="xs"
          />
        </div>
      </div>

      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <UIcon :name="invocation.output.condition.icon" class="size-6 text-white" />
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

          <UIcon :name="forecast.condition.icon" class="size-5 text-white" />
          <div class="text-xs font-medium">
            <div>
              {{ formatTemp(forecast.high) }}
            </div>
            <div class="text-white/60">
              {{ formatTemp(forecast.low) }}
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
