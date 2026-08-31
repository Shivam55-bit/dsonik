import { useEffect, useRef } from 'react'

// Adds an `in` class to the element when it scrolls into view (used with `.reveal`).
export default function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const nodes = el.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window) || nodes.length === 0) {
      nodes.forEach((n) => n.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
  return ref
}
