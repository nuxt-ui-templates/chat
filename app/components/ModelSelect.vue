<script setup lang="ts">
const { model, models } = useModels()

const items = computed(() => models.map(model => ({
  label: model,
  value: model,
  icon: `i-simple-icons-${model.split('/')[0]}`
})))
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="items"
    :icon="`i-simple-icons-${model.split('/')[0]}`"
    variant="ghost"
    value-key="value"
    class="hover:bg-default focus:bg-default data-[state=open]:bg-default"
    :content="{
      align: 'start',
      side: 'bottom',
      sideOffset: 4
    }"
    :ui="{
      trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
      content: 'w-fit'
    }"
  />
</template>
