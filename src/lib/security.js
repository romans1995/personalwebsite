const CLOUDINARY_HOST_SUFFIX = 'res.cloudinary.com'

export function sanitizeText(value, maxLength = 300) {
  const nextValue = String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return nextValue.slice(0, maxLength)
}

export function sanitizeMultilineText(value, maxLength = 3000) {
  const nextValue = String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .trim()

  return nextValue.slice(0, maxLength)
}

export function sanitizeSectionId(value) {
  const normalized = sanitizeText(value, 60)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || 'section'
}

export function normalizeUrl(value, options = {}) {
  const {
    allowHash = false,
    allowRelative = false,
    allowMailto = false,
    allowTel = false,
    fallback = '#',
  } = options

  const rawValue = String(value ?? '').trim()

  if (!rawValue) return fallback

  if (allowHash && /^#[a-zA-Z0-9-_]{1,64}$/.test(rawValue)) {
    return rawValue
  }

  if (allowRelative && /^\/[a-zA-Z0-9/_-]*$/.test(rawValue)) {
    return rawValue
  }

  if (allowMailto && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(rawValue)) {
    return rawValue
  }

  if (allowTel && /^tel:\+?[0-9\-()\s]{6,20}$/i.test(rawValue)) {
    return rawValue.replace(/\s+/g, '')
  }

  try {
    const parsed = new URL(rawValue)
    const protocol = parsed.protocol.toLowerCase()

    if (protocol === 'https:') {
      return parsed.toString()
    }

    if (protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname)) {
      return parsed.toString()
    }
  } catch {
    return fallback
  }

  return fallback
}

export function isSafeExternalUrl(value) {
  try {
    const parsed = new URL(value)
    const protocol = parsed.protocol.toLowerCase()
    return protocol === 'https:' || (protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname))
  } catch {
    return false
  }
}

export function normalizeImageUrl(value, fallback = '') {
  const rawValue = String(value ?? '').trim()
  if (!rawValue) return fallback

  try {
    const parsed = new URL(rawValue)
    const protocol = parsed.protocol.toLowerCase()
    const host = parsed.hostname.toLowerCase()

    if (protocol !== 'https:') return fallback
    if (!host.endsWith(CLOUDINARY_HOST_SUFFIX)) return fallback

    return parsed.toString()
  } catch {
    return fallback
  }
}

export function sanitizeClassToken(value, maxLength = 120) {
  return sanitizeText(value, maxLength).replace(/[^a-zA-Z0-9\-_/:%\[\].\s]/g, '').trim()
}
