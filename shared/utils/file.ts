export interface FileWithStatus {
  file: File
  id: string
  previewUrl: string
  status: 'uploading' | 'uploaded' | 'error'
  uploadedUrl?: string
  error?: string
}

export interface UploadResponse {
  url: string
  pathname: string
  contentType: string
  size: number
}

export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/', 'application/pdf', 'text/csv'],
  acceptPattern: 'image/*,application/pdf,.csv,text/csv'
} as const

export function isValidFileType(mimeType: string): boolean {
  return FILE_UPLOAD_CONFIG.allowedMimeTypes.some(type =>
    mimeType.startsWith(type) || mimeType === type
  )
}

export function validateFileSize(size: number): { valid: boolean, error?: string } {
  if (size > FILE_UPLOAD_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${FILE_UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`
    }
  }
  return { valid: true }
}

export function getFileIcon(mimeType: string, fileName?: string): string {
  if (mimeType.startsWith('image/')) return 'i-lucide-image'
  if (mimeType === 'application/pdf') return 'i-lucide-file-text'
  if (mimeType === 'text/csv' || fileName?.endsWith('.csv')) return 'i-lucide-file-spreadsheet'
  return 'i-lucide-file'
}

export function removeRandomSuffix(filename: string): string {
  return filename.replace(/^(.+)-[a-zA-Z0-9]+(\.[^.]+)$/, '$1$2')
}

export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts and dangerous characters
  return filename
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '-')
    .replace(/[<>:"|?*]/g, '')
    .trim()
}
