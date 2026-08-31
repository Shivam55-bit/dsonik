const API_ORIGIN = (
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  'https://dsonik-backend-l8xa.onrender.com'
).replace(/\/$/, '')

export const resolveImageUrl = (value, fallback = '') => {
  if (!value || typeof value !== 'string') return fallback

  const normalized = value.trim().replace(/\\/g, '/')
  if (!normalized) return fallback

  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:')
  ) {
    return normalized
  }

  const uploadsIndex = normalized.toLowerCase().lastIndexOf('/uploads/')
  if (uploadsIndex !== -1) {
    return `${API_ORIGIN}${normalized.slice(uploadsIndex)}`
  }

  if (normalized.toLowerCase().startsWith('uploads/')) {
    return `${API_ORIGIN}/${normalized}`
  }

  if (normalized.startsWith('/dsonik/')) return normalized
  if (normalized.startsWith('/')) return normalized

  return `/dsonik/${normalized}`
}

export const getImageValue = (source) => {
  if (!source) return ''
  if (typeof source === 'string') return source

  return (
    source.url ||
    source.secure_url ||
    source.path ||
    source.imageUrl ||
    source.image_url ||
    source.image ||
    ''
  )
}

export const resolveEntityImage = (source, fallback = '') =>
  resolveImageUrl(getImageValue(source), fallback)
