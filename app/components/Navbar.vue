<template>
  <UDashboardNavbar
    class="absolute top-0 inset-x-0 border-b-0 z-10 backdrop-blur lg:backdrop-blur-none pointer-events-none sm:px-4"
    :ui="{ left: 'pointer-events-auto min-w-0', right: 'pointer-events-auto' }"
  >
    <template #left>
      <slot name="title" />
    </template>

    <template #right>
      <slot />

      <UColorModeButton />

      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-circle-plus"
        to="/"
        class="lg:hidden"
        aria-label="New chat"
      />
    </template>
  </UDashboardNavbar>
</template>
