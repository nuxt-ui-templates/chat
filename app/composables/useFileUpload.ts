import type { MaybeRefOrGetter } from 'vue'
import type { UIMessage } from 'ai'
import type { ChatPromptQueueItem } from '@nuxt/ui'

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

export function useFileUploadWithStatus(chatId: string, chat?: { queue: MaybeRefOrGetter<ChatPromptQueueItem[]>, messages: MaybeRefOrGetter<UIMessage[]> }) {
  const files = ref<FileWithStatus[]>([])
  // Files of submitted messages, they stay uploaded until their message is sent or removed from the queue
  const heldFiles = shallowReactive(new Map<File, FileWithStatus>())
  const toast = useToast()
  const { loggedIn } = useUserSession()

  const { csrf, headerName } = useCsrf()

  const upload = useUpload(`/api/upload/${chatId}`, {
    method: 'PUT',
    headers: { [headerName]: csrf }
  })

  // Looked up again after each upload: a file can be removed from the prompt or submitted while it uploads
  function updateFile(id: string, patch: Partial<FileWithStatus>) {
    const index = files.value.findIndex(f => f.id === id)
    if (index !== -1) {
      files.value[index] = { ...files.value[index]!, ...patch }
      return true
    }

    const held = [...heldFiles.values()].find(f => f.id === id)
    if (!held) return false

    heldFiles.set(held.file, { ...held, ...patch })
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

  const uploadedFiles = computed(() => toFileParts(files.value))

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

      // A queued message put back in the prompt keeps its uploads
      for (const file of next) {
        const held = heldFiles.get(file)
        if (held) {
          heldFiles.delete(file)
          files.value = [...files.value, held]
        }
      }

      const added = next.filter(file => !files.value.some(f => f.file === file))
      if (added.length) {
        uploadFiles(added)
      }

      // The prompt renders `files` by index, keep them in its order
      files.value = next.map(file => files.value.find(f => f.file === file)).filter(f => !!f)
    }
  })

  // A submitted message takes its files out of the prompt, uploaded or not, until it is sent
  function holdFiles(held: File[] = []) {
    for (const fileWithStatus of files.value.filter(f => held.includes(f.file))) {
      heldFiles.set(fileWithStatus.file, fileWithStatus)
    }
    files.value = files.value.filter(f => !held.includes(f.file))
  }

  function isUploading(held: File[] = []) {
    return held.some(file => heldFiles.get(file)?.status === 'uploading')
  }

  // The uploaded files of a submitted message, with the file behind each part
  function getFileParts(held: File[] = []) {
    return held.flatMap((file) => {
      const fileWithStatus = heldFiles.get(file)
      return fileWithStatus ? toFileParts([fileWithStatus]).map(part => ({ file, part })) : []
    })
  }

  // A file leaves once its message is gone from the queue: sent, it stays in the blob, removed, it is deleted
  if (chat) {
    watch([() => toValue(chat.queue), () => toValue(chat.messages)], ([items, messages]) => {
      for (const [file, fileWithStatus] of heldFiles) {
        if (items.some(item => item.files?.includes(file))) continue

        heldFiles.delete(file)
        const sent = messages.some(message => message.parts.some(part => part.type === 'file' && part.url === fileWithStatus.uploadedUrl))
        if (!sent && fileWithStatus.uploadedPathname) {
          deleteBlob(fileWithStatus.uploadedPathname)
        }
      }
    })
  }

  return {
    files,
    promptFiles,
    uploading,
    uploadedFiles,
    holdFiles,
    isUploading,
    getFileParts,
    addFiles: uploadFiles,
    removeFile,
    clearFiles
  }
}

function toFileParts(files: FileWithStatus[]) {
  return files
    .filter(f => f.status === 'uploaded' && f.uploadedUrl)
    .map(f => ({
      type: 'file' as const,
      mediaType: f.file.type,
      url: f.uploadedUrl!
    }))
}
