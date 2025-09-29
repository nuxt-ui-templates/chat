import { useDropZone } from '@vueuse/core'

export function useChatFileUpload(files: Ref<File[]>) {
  const dropZoneRef = ref<HTMLDivElement>()

  const { isOverDropZone } = useDropZone(dropZoneRef, {
    multiple: true,
    preventDefaultForUnhandled: true,
    onDrop(droppedFiles) {
      if (!droppedFiles?.length) {
        return
      }

      files.value = [...files.value, ...droppedFiles]
    }
  })

  function createObjectUrl(file: File): string {
    return URL.createObjectURL(file)
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
    dropZoneRef,
    isOverDropZone,
    createObjectUrl,
    clearFiles,
    convertFilesToDataURLs
  }
}
