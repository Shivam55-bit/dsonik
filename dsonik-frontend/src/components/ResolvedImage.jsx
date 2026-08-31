import React, { useEffect, useState } from 'react'
import { resolveImageUrl } from '../utils/imageUrl'

export default function ResolvedImage({ value, fallback = '', alt = '', className = '', placeholder = 'No image', ...props }) {
  const src = resolveImageUrl(value, fallback)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return <span className={`image-placeholder ${className}`.trim()}>{placeholder}</span>
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
