<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nuxt AI Chatbot template'
const description = 'A full-featured, hackable Nuxt AI chatbot template made with Nuxt UI.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://assets.hub.nuxt.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL2NoYXQtdGVtcGxhdGUubnV4dC5kZXYiLCJpYXQiOjE3NDI4NDY2ODB9.n4YCsoNz8xatox7UMoYZFNo7iS1mC_DT0h0A9cKRoTw.jpg?theme=light',
  twitterImage: 'https://assets.hub.nuxt.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL2NoYXQtdGVtcGxhdGUubnV4dC5kZXYiLCJpYXQiOjE3NDI4NDY2ODB9.n4YCsoNz8xatox7UMoYZFNo7iS1mC_DT0h0A9cKRoTw.jpg?theme=light',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp :toaster="{ position: 'top-right' }">
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
