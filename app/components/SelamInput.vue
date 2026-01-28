<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
  (e: 'files-selected', files: File[]): void
}>()

const { loggedIn } = useUserSession()
const textarea = ref<HTMLTextAreaElement | null>(null)
const inputId = useId()

function autoResize() {
  if (textarea.value) {
    textarea.value.style.height = 'auto'
    textarea.value.style.height = textarea.value.scrollHeight + 'px'
  }
}

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  autoResize()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('submit')
  }
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length > 0) {
    emit('files-selected', files)
  }
  input.value = ''
}

watch(() => props.modelValue, () => {
  nextTick(autoResize)
})

onMounted(() => {
  autoResize()
})
</script>

<template>
  <div class="relative bg-surface-light dark:bg-surface-dark rounded-[2rem] shadow-soft p-4 flex flex-col min-h-[140px] border border-transparent dark:border-gray-700 focus-within:border-gray-300 dark:focus-within:border-gray-600 transition-all duration-300 group">
    <!-- Files Slot -->
    <div v-if="$slots.files" class="mb-2">
      <slot name="files" />
    </div>

    <textarea
      ref="textarea"
      :value="modelValue"
      rows="1"
      placeholder="Ask anything"
      class="w-full bg-transparent border-0 focus:ring-0 p-3 text-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none font-medium max-h-[200px] overflow-y-auto"
      :disabled="disabled"
      @input="handleInput"
      @keydown="handleKeydown"
    />

    <div class="flex justify-between items-end mt-4 px-2">
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <!-- Attach Button -->
        <UTooltip :text="!loggedIn ? 'Login to upload' : ''">
          <label
            :for="inputId"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
            :class="{ 'opacity-50 cursor-not-allowed': !loggedIn }"
          >
            <span class="material-icons-round text-[20px] transform rotate-45">attach_file</span>
          </label>
          <input
            :id="inputId"
            type="file"
            multiple
            :accept="FILE_UPLOAD_CONFIG.acceptPattern"
            class="hidden"
            :disabled="!loggedIn"
            @change="handleFileSelect"
          >
        </UTooltip>

        <!-- Deep Search -->
        <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all cursor-pointer">
          <span class="material-icons-outlined text-[16px]">travel_explore</span>
          Deep Search
        </button>

        <!-- Reason -->
        <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all cursor-pointer">
          <span class="material-icons-outlined text-[16px]">lightbulb</span>
          Reason
        </button>

        <!-- More -->
        <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition-colors cursor-pointer">
          <span class="material-icons-outlined text-[18px]">more_horiz</span>
        </button>
      </div>

      <!-- Send Button -->
      <button
        class="w-9 h-9 flex items-center justify-center rounded-full bg-primary hover:bg-opacity-90 text-white shadow-md hover:shadow-lg transform active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        :disabled="disabled || !modelValue.trim()"
        @click="$emit('submit')"
      >
        <span class="material-icons-round text-[20px]">arrow_upward</span>
      </button>
    </div>
  </div>
</template>
