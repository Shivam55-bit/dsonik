import { useEffect } from 'react'

function setMeta(attr, key, value) {
  if (!value) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

// Lightweight, dependency-free SEO manager (React 19 compatible).
export default function Seo({ title, description, image, type = 'website' }) {
  useEffect(() => {
    if (title) document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', type)
    if (image) setMeta('property', 'og:image', image)
  }, [title, description, image, type])

  return null
}
