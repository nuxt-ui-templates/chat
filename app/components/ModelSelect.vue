<script setup lang="ts">
const { model, models, formatModelName } = useModels()

const items = computed(() => models.map(model => ({
  label: formatModelName(model),
  value: model,
  icon: `i-simple-icons-${model.split('/')[0]}`
})))
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="items"
    size="sm"
    :icon="`i-simple-icons-${model.split('/')[0]}`"
    variant="ghost"
    value-key="value"
    class="hover:bg-default focus:bg-default data-[state=open]:bg-default"
    :ui="{
      trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
    }"
  />
</template>
