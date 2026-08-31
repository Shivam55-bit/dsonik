import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import ResolvedImage from '../components/ResolvedImage'
import clientService from '../services/clientService'
import { extractList, resolveImageUrl } from '../utils/helpers'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchClientsData = async () => {
      try {
        setLoading(true)
        const res = await clientService.getClients()
        if (isMounted) {
          setClients(extractList(res, 'clients'))
        }
      } catch (err) {
        console.error('Fetch clients error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchClientsData()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="page">
      <Seo title="Our Clients — DSONIK" description="DSONIK is trusted by 950+ manufacturers across automotive, packaging, medical and electronics industries." />
      <div className="crumbs"><Link to="/">Home</Link> <span>/</span> <span>Our Clients</span></div>
      <div className="section-head" style={{ margin: '0 auto 32px' }}>
        <span className="eyebrow">Trusted By</span>
        <h1 className="section-title">Our Esteemed Customers</h1>
        <p className="section-sub">Over 950 manufacturers rely on DSONIK welding technology.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
          <p>Loading clients list...</p>
        </div>
      ) : clients.length > 0 ? (
        <div className="clients-strip">
          {clients.map((client) => {
            const logoUrl = client.logo ? resolveImageUrl(client.logo) : ''
            const content = logoUrl ? (
              <ResolvedImage value={logoUrl} alt={client.name} style={{ maxHeight: 40, maxWidth: 140, objectFit: 'contain' }} />
            ) : (
              client.name
            )

            if (client.website) {
              return (
                <a
                  key={client._id || client.name}
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="client-logo"
                  title={client.name}
                >
                  {content}
                </a>
              )
            }

            return (
              <div key={client._id || client.name} className="client-logo">
                {content}
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
          <p style={{ fontSize: 16, fontWeight: 500 }}>No clients available.</p>
        </div>
      )}
    </div>
  )
}
