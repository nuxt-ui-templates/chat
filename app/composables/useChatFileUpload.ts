export function useChatFileUpload(files: Ref<File[]>) {
  const isDragOver = ref(false)

  function createObjectUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer?.types.includes('Files')) {
      isDragOver.value = true
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    isDragOver.value = true
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    isDragOver.value = false
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    isDragOver.value = false

    const arrayFiles = Array.from(e.dataTransfer?.files || [])

    if (arrayFiles.length > 0) {
      files.value = [...files.value, ...arrayFiles]
    }
  }

  function clearFiles() {
    files.value.forEach((file) => {
      URL.revokeObjectURL(createObjectUrl(file))
    })
    files.value = []
  }

  async function convertFilesToDataURLs(files: File[]) {
    return Promise.all(
      files.map(
        file =>
          new Promise<{
            type: 'file'
            mediaType: string
            url: string
          }>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                type: 'file',
                mediaType: file.type,
                url: reader.result as string
              })
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
      )
    )
  }

  return {
    isDragOver: readonly(isDragOver),
    createObjectUrl,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFiles,
    convertFilesToDataURLs
  }
}
