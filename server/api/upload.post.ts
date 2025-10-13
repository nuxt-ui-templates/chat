import { put } from '@vercel/blob'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = ['image/', 'application/pdf', 'text/csv']

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

  if (file.size > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    })
  }

  const isAllowedType = ALLOWED_FILE_TYPES.some(type =>
    file.type.startsWith(type) || file.type === type
  )

  if (!isAllowedType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File type not allowed. Only images, PDFs, and CSV files are accepted.'
    })
  }

  const filename = `${username}/${chatId}/${file.name}`

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
