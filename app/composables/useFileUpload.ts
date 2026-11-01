interface BlobResult {
  pathname: string
  url?: string
  contentType?: string
  size: number
}

function fileToInput(file: File): HTMLInputElement {
  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(file)

  const input = document.createElement('input')
  input.type = 'file'
  input.files = dataTransfer.files

  return input
}

export function useFileUploadWithStatus(chatId: string) {
  const files = ref<FileWithStatus[]>([])
  const toast = useToast()
  const { loggedIn } = useUserSession()

  const { csrf, headerName } = useCsrf()

  const upload = useUpload(`/api/upload/${chatId}`, {
    method: 'PUT',
    headers: { [headerName]: csrf }
  })

  // Looked up again after each upload: a file can be removed from the prompt while it uploads
  function updateFile(id: string, patch: Partial<FileWithStatus>) {
    const index = files.value.findIndex(f => f.id === id)
    if (index === -1) return false

    files.value[index] = { ...files.value[index]!, ...patch }
    return true
  }

  function deleteBlob(pathname: string) {
    $fetch(`/api/upload/${pathname}` as string, {
      method: 'DELETE',
      headers: { [headerName]: csrf }
    }).catch((error) => {
      console.error('Failed to delete file from blob:', error)
    })
  }

  async function uploadFiles(newFiles: File[]) {
    if (!loggedIn.value) {
      return
    }

    const filesWithStatus: FileWithStatus[] = newFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      status: 'uploading' as const
    }))

    files.value = [...files.value, ...filesWithStatus]

    const uploadPromises = filesWithStatus.map(async (fileWithStatus) => {
      try {
        const input = fileToInput(fileWithStatus.file)
        const response = await upload(input) as BlobResult | BlobResult[] | undefined

        if (!response) {
          throw new Error('Upload failed')
        }

        const result = Array.isArray(response) ? response[0] : response

        if (!result) {
          throw new Error('Upload failed')
        }

        if (!updateFile(fileWithStatus.id, { status: 'uploaded', uploadedUrl: result.url, uploadedPathname: result.pathname })) {
          deleteBlob(result.pathname)
        }
      } catch (error) {
        const errorMessage = (error as { data?: { message?: string } }).data?.message
          || (error as Error).message
          || 'Upload failed'
        toast.add({
          title: 'Upload failed',
          description: errorMessage,
          icon: 'i-lucide-alert-circle',
          color: 'error'
        })
        updateFile(fileWithStatus.id, { status: 'error', error: errorMessage })
      }
    })

    await Promise.allSettled(uploadPromises)
  }

  const uploading = computed(() =>
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
    if (!file) return

    files.value = files.value.filter(f => f.id !== id)

    if (file.status === 'uploaded' && file.uploadedPathname) {
      deleteBlob(file.uploadedPathname)
    }
  }

  function clearFiles() {
    files.value = []
  }

  // The `File[]` behind `UChatPrompt` `v-model:files`: the prompt adds files on paste, drop or pick,
  // they get uploaded here, and a file removed from the prompt is removed from the blob too
  const promptFiles = computed<File[]>({
    get: () => files.value.map(f => f.file),
    set: (next) => {
      for (const fileWithStatus of files.value.filter(f => !next.includes(f.file))) {
        removeFile(fileWithStatus.id)
      }

      const added = next.filter(file => !files.value.some(f => f.file === file))
      if (added.length) {
        uploadFiles(added)
      }
    }
  })

  return {
    files,
    promptFiles,
    uploading,
    uploadedFiles,
    addFiles: uploadFiles,
    removeFile,
    clearFiles
  }
}
