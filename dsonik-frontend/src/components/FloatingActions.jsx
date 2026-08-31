import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'

const WHATSAPP_NUMBER = '919000000000' // update with the company WhatsApp number

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fab-stack">
      {showTop && (
        <button
          className="fab fab-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <Icon name="arrowUp" size={22} />
        </button>
      )}
      <Link to="/contact" className="fab fab-inq" aria-label="Request an inquiry" title="Request a quote">
        <Icon name="mail" size={22} />
      </Link>
      <a
        className="fab fab-wa"
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi DSONIK, I would like a product quote.')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <Icon name="whatsapp" size={26} />
      </a>
    </div>
  )
}
