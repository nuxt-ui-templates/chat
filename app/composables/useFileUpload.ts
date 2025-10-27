function createObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

async function uploadFileToBlob(file: File, chatId: string): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('chatId', chatId)

  return await $fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
}

export function useFileUploadWithStatus(chatId: string) {
  const files = ref<FileWithStatus[]>([])
  const toast = useToast()
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

    const uploadPromises = filesWithStatus.map(async (fileWithStatus) => {
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
        toast.add({
          title: 'Upload failed',
          description: (error as { statusMessage?: string }).statusMessage || 'Upload failed',
          icon: 'i-lucide-alert-circle',
          color: 'error'
        })
        if (index !== -1) {
          files.value[index] = {
            ...files.value[index]!,
            status: 'error',
            error: (error as { statusMessage?: string }).statusMessage || 'Upload failed'
          }
        }
      }
    })

    await Promise.allSettled(uploadPromises)
  }

  const { dropzoneRef, isDragging } = useFileUpload({
    accept: FILE_UPLOAD_CONFIG.acceptPattern,
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

      if (file.status === 'uploaded' && file.uploadedUrl) {
        $fetch('/api/upload', {
          method: 'DELETE',
          body: { url: file.uploadedUrl }
        }).catch((error) => {
          console.error('Failed to delete file from blob:', error)
        })
      }
    }
  }

  function clearFiles() {
    files.value.forEach((fileWithStatus) => {
      URL.revokeObjectURL(fileWithStatus.previewUrl)
    })
    files.value = []
  }

  onUnmounted(() => {
    clearFiles()
  })

  return {
    dropzoneRef,
    isDragging,
    files,
    isUploading,
    uploadedFiles,
    addFiles: uploadFiles,
    removeFile,
    clearFiles
  }
}
