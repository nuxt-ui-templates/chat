import { put } from '@vercel/blob'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required to upload files'
    })
  }

  const username = session.user.username

  const form = await readFormData(event)
  const file = form.get('file') as File
  const chatId = form.get('chatId') as string | null

  if (!file) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file provided'
    })
  }

  if (!chatId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chat ID is required'
    })
  }

  const sizeValidation = validateFileSize(file.size)
  if (!sizeValidation.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: sizeValidation.error
    })
  }

  if (!isValidFileType(file.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File type not allowed. Only images, PDFs, and CSV files are accepted.'
    })
  }

  // Sanitize filename to prevent path traversal
  const safeFilename = sanitizeFilename(file.name)
  const filename = `${username}/${chatId}/${safeFilename}`

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: true,
    allowOverwrite: true
  })

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: file.type,
    size: file.size
  }
})
