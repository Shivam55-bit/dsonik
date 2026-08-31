import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Icon from '../components/Icon'
import siteContentService from '../services/siteContentService'

export default function About() {
  const [contentMap, setContentMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchAboutData = async () => {
      try {
        setLoading(true)
        const res = await siteContentService.getSiteContent({ section: 'about' })
        if (isMounted && res.data) {
          setContentMap(res.data)
        }
      } catch (err) {
        console.error('Fetch about page content error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchAboutData()
    return () => { isMounted = false }
  }, [])

  const main = contentMap.about_main || {
    title: 'About DSONIK',
    subtitle: 'Your Technology Partner',
    description: 'DSONIK — Your Technology Partner — is a manufacturing company involved in the sales and service of plastic welding machinery including ultrasonic plastic welding, spin welding, impulse welding, hot-plate welding and vibration welding.',
    content: 'Through techno-commercial tie-ups with world-renowned technology brands, we bring best-in-class, affordable welding solutions to industry.'
  }

  const mission = contentMap.about_mission || {
    title: 'Our Mission',
    description: 'To empower manufacturers with reliable, precise and cost-effective welding technology.',
    icon: 'target'
  }

  const vision = contentMap.about_vision || {
    title: 'Our Vision',
    description: 'To be India’s most trusted partner for plastic welding and assembly automation.',
    icon: 'globe'
  }

  const values = contentMap.about_values || {
    title: 'Our Values',
    description: 'Quality, integrity, innovation and unwavering after-sales support.',
    icon: 'heart'
  }

  const cta = contentMap.about_cta || {
    title: 'Partner with DSONIK',
    description: 'Let our engineers recommend the right welding technology for your product.',
    buttonText: 'Contact Us',
    buttonLink: '/contact'
  }

  const cards = [
    { key: 'mission', icon: mission.icon || 'target', t: mission.title || 'Our Mission', d: mission.description },
    { key: 'vision', icon: vision.icon || 'globe', t: vision.title || 'Our Vision', d: vision.description },
    { key: 'values', icon: values.icon || 'heart', t: values.title || 'Our Values', d: values.description }
  ]

  return (
    <div className="page">
      <Seo title={`${main.title} — DSONIK`} description={main.description} />
      <div className="crumbs"><Link to="/">Home</Link> <span>/</span> <span>About Us</span></div>

      <h1 className="section-title" style={{ marginBottom: 12 }}>{main.title}</h1>
      {main.subtitle && <span className="eyebrow" style={{ display: 'block', marginBottom: 16, color: '#6366F1' }}>{main.subtitle}</span>}

      <p className="section-sub" style={{ textAlign: 'left', maxWidth: 820 }}>
        {main.description}
      </p>
      {main.content && (
        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#475569', maxWidth: 820, marginTop: 12 }}>
          {main.content}
        </p>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
          <p>Loading about details...</p>
        </div>
      ) : (
        <div className="apps-grid">
          {cards.map((v) => (
            <div key={v.key} className="app-card">
              <div className="app-ic"><Icon name={v.icon} /></div>
              <h3>{v.t}</h3>
              <p>{v.d}</p>
            </div>
          ))}
        </div>
      )}

      <div className="cta-band reveal in" style={{ marginTop: 44 }}>
        <h2>{cta.title}</h2>
        <p>{cta.description}</p>
        <div className="cta-actions">
          <Link to={cta.buttonLink || '/contact'} className="btn btn-primary">
            {cta.buttonText || 'Contact Us'}
          </Link>
        </div>
      </div>
    </div>
  )
}
