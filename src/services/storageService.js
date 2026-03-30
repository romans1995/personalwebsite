const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  baseFolder: import.meta.env.VITE_CLOUDINARY_BASE_FOLDER || 'roman-personal-site',
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
])

function normalizeFolder(folder) {
  const value = String(folder || 'misc').trim().toLowerCase()

  if (!/^[a-z0-9/-]{1,60}$/.test(value) || value.includes('..')) {
    return 'misc'
  }

  if (/^profile$|^projects\/\d{1,3}$|^experience\/\d{1,3}$|^misc$/.test(value)) {
    return value
  }

  return 'misc'
}

export const isCloudinaryConfigured = Boolean(
  cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset,
)

export async function uploadPublicImage(file, folder = 'misc') {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured.')
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error('Only JPG, PNG, WEBP, AVIF, and GIF images are allowed.')
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image is too large. Maximum size is 5MB.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', cloudinaryConfig.uploadPreset)
  formData.append('folder', `${cloudinaryConfig.baseFolder}/${normalizeFolder(folder)}`)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  )

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error?.message || 'Cloudinary upload failed.')
  }

  const payload = await response.json()
  const secureUrl = String(payload.secure_url || '')
  const expectedPrefix = `https://res.cloudinary.com/${cloudinaryConfig.cloudName.toLowerCase()}/`

  if (!secureUrl.toLowerCase().startsWith(expectedPrefix)) {
    throw new Error('Unexpected Cloudinary response URL.')
  }

  return secureUrl
}
