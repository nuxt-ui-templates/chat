export function useFileUploadWithStatus(chatId: string) {
  const files = ref<FileWithStatus[]>([])

  const { loggedIn } = useUserSession()

  async function uploadFiles(newFiles: File[]) {
    if (!loggedIn.value) {
      return
    }

    const filesWithStatus: FileWithStatus[] = newFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      previewUrl: createObjectUrl(file),
      status: 'uploading' as const
    }))

    files.value = [...files.value, ...filesWithStatus]

    for (const fileWithStatus of filesWithStatus) {
      try {
        const response = await uploadFileToBlob(fileWithStatus.file, chatId)

        const index = files.value.findIndex(f => f.id === fileWithStatus.id)
        if (index !== -1) {
          files.value[index] = {
            ...files.value[index]!,
            status: 'uploaded',
            uploadedUrl: response.url
          }
        }
      } catch (error) {
        const index = files.value.findIndex(f => f.id === fileWithStatus.id)
        if (index !== -1) {
          files.value[index] = {
            ...files.value[index]!,
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          }
        }
      }
    }
  }

  const { dropzoneRef, isDragging } = useFileUpload({
    accept: 'image/*,application/pdf,.csv,text/csv',
    multiple: true,
    onUpdate: uploadFiles
  })

  const isUploading = computed(() =>
    files.value.some(f => f.status === 'uploading')
  )

  const uploadedFiles = computed(() =>
    files.value
      .filter(f => f.status === 'uploaded' && f.uploadedUrl)
      .map(f => ({
        type: 'file' as const,
        mediaType: f.file.type,
        url: f.uploadedUrl!
      }))
  )

  function removeFile(id: string) {
    const file = files.value.find(f => f.id === id)
    if (file) {
      URL.revokeObjectURL(file.previewUrl)
      files.value = files.value.filter(f => f.id !== id)
    }
  }

  function clear() {
    clearFiles(files)
  }

  return {
    dropzoneRef,
    isDragging,
    files,
    isUploading,
    uploadedFiles,
    addFiles: uploadFiles,
    removeFile,
    clearFiles: clear
  }
}
