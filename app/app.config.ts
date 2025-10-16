export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral'
    },
    chatMessage: {
      slots: {
        content: 'group-data-[role=assistant]/message:w-full'
      }
    }
  }
})
