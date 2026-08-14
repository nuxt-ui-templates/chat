<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()
const { user, clear } = useUserSession()

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value?.name || user.value?.username,
  avatar: {
    src: user.value?.avatar,
    alt: user.value?.name || user.value?.username
  }
}], [{
  label: 'Theme',
  icon: 'i-lucide-palette',
  children: [{
    label: 'Primary',
    slot: 'chip',
    chip: appConfig.ui.colors.primary,
    content: {
      align: 'center',
      collisionPadding: 16
    },
    children: colors.map(color => ({
      label: color,
      chip: color,
      slot: 'chip',
      checked: appConfig.ui.colors.primary === color,
      type: 'checkbox',
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.primary = color
      }
    }))
  }, {
    label: 'Neutral',
    slot: 'chip',
    chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
    content: {
      align: 'end',
      collisionPadding: 16
    },
    children: neutrals.map(color => ({
      label: color,
      chip: color === 'neutral' ? 'old-neutral' : color,
      slot: 'chip',
      type: 'checkbox',
      checked: appConfig.ui.colors.neutral === color,
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.neutral = color
      }
    }))
  }]
}, {
  label: 'Appearance',
  icon: 'i-lucide-sun-moon',
  children: [{
    label: 'Light',
    icon: 'i-lucide-sun',
    type: 'checkbox',
    checked: colorMode.value === 'light',
    onSelect(e: Event) {
      e.preventDefault()

      colorMode.preference = 'light'
    }
  }, {
    label: 'Dark',
    icon: 'i-lucide-moon',
    type: 'checkbox',
    checked: colorMode.value === 'dark',
    onUpdateChecked(checked: boolean) {
      if (checked) {
        colorMode.preference = 'dark'
      }
    },
    onSelect(e: Event) {
      e.preventDefault()
    }
  }]
}], [{
  label: 'Templates',
  icon: 'i-lucide-layout-template',
  children: [{
    label: 'Starter',
    to: 'https://starter-template.nuxt.dev/'
  }, {
    label: 'Landing',
    to: 'https://landing-template.nuxt.dev/'
  }, {
    label: 'Docs',
    to: 'https://docs-template.nuxt.dev/'
  }, {
    label: 'SaaS',
    to: 'https://saas-template.nuxt.dev/'
  }, {
    label: 'Dashboard',
    to: 'https://dashboard-template.nuxt.dev/'
  }, {
    label: 'Chat',
    to: 'https://chat-template.nuxt.dev/',
    color: 'primary',
    checked: true,
    type: 'checkbox'
  }, {
    label: 'Portfolio',
    to: 'https://portfolio-template.nuxt.dev/'
  }, {
    label: 'Changelog',
    to: 'https://changelog-template.nuxt.dev/'
  }, {
    label: 'Editor',
    to: 'https://editor-template.nuxt.dev/'
  }, {
    label: 'Calendar',
    to: 'https://calendar-template.nuxt.dev/'
  }]
}], [{
  label: 'Documentation',
  icon: 'i-lucide-book-open',
  to: 'https://ui.nuxt.com/docs/getting-started/installation/nuxt',
  target: '_blank'
}, {
  label: 'GitHub repository',
  icon: 'i-simple-icons-github',
  to: 'https://github.com/nuxt-ui-templates/chat',
  target: '_blank'
}, {
  label: 'Deploy to Vercel',
  icon: 'i-simple-icons-vercel',
  to: 'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fchat&repository-name=chat&env=NUXT_OAUTH_GITHUB_CLIENT_ID%2CNUXT_OAUTH_GITHUB_CLIENT_SECRET%2CNUXT_SESSION_PASSWORD&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22tursocloud%22%2C%22productSlug%22%3A%22database%22%2C%22protocol%22%3A%22storage%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D&demo-title=Nuxt+Chat+Template&demo-description=An+AI+chatbot+template+with+GitHub+authentication+and+persistent+chat+history+powered+by+Vercel+AI+SDK.&demo-url=https%3A%2F%2Fchat-template.nuxt.dev&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fchat-dark.png',
  target: '_blank'
}], [{
  label: 'Log out',
  icon: 'i-lucide-log-out',
  onSelect() {
    clear()
    navigateTo('/')
  }
}]]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        label: collapsed ? undefined : (user?.name || user?.username),
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      :avatar="{
        src: user?.avatar || undefined,
        alt: user?.name || user?.username
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
