import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Icon from '../components/Icon'
import inquiryService from '../services/inquiryService'
import contactInfoService from '../services/contactInfoService'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [contact, setContact] = useState(null)
  const [contactLoading, setContactLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchInfo = async () => {
      try {
        setContactLoading(true)
        const res = await contactInfoService.getContactInfo()
        if (isMounted && res.data) {
          setContact(res.data)
        }
      } catch (err) {
        console.error('Fetch contact info error:', err)
      } finally {
        if (isMounted) setContactLoading(false)
      }
    }
    fetchInfo()
    return () => { isMounted = false }
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await inquiryService.sendInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        subject: 'Contact page inquiry',
        message: form.message,
        source: 'contact-section'
      })
      setSent(true)
      setForm({ name: '', email: '', phone: '', company: '', message: '' })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit inquiry')
    } finally {
      setSubmitting(false)
    }
  }

  const phones = contact?.phoneNumbers || ['+91-120-4217390', '+91-120-4217391']
  const emails = contact?.emailAddresses || ['info@dsonik.com', 'sales@dsonik.com']
  const address = contact?.officeAddress || 'DSONIK Pvt. Ltd., Industrial Area Site-4, Sahibabad, Ghaziabad — 201010'
  const whatsapp = contact?.whatsappNumber || '+919876543210'

  return (
    <div className="page">
      <Seo title="Contact Us — DSONIK" description="Get in touch with DSONIK for quotes, product enquiries and after-sales support." />
      <div className="crumbs"><Link to="/">Home</Link> <span>/</span> <span>Contact Us</span></div>
      <div className="section-head" style={{ margin: '0 auto 32px' }}>
        <span className="eyebrow">Get In Touch</span>
        <h1 className="section-title">Contact DSONIK</h1>
      </div>

      <div className="welcome" style={{ alignItems: 'start' }}>
        <div>
          <div className="app-card" style={{ marginBottom: 16 }}>
            <div className="app-ic"><Icon name="phone" /></div>
            <h3>Call Us</h3>
            <p>
              {phones.map((p, idx) => (
                <span key={idx}>
                  <a href={`tel:${p.replace(/[^0-9+]/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p}</a>
                  {idx < phones.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          </div>

          <div className="app-card" style={{ marginBottom: 16 }}>
            <div className="app-ic"><Icon name="mail" /></div>
            <h3>Email</h3>
            <p>
              {emails.map((em, idx) => (
                <span key={idx}>
                  <a href={`mailto:${em}`} style={{ color: 'inherit', textDecoration: 'none' }}>{em}</a>
                  {idx < emails.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          </div>

          <div className="app-card" style={{ marginBottom: 16 }}>
            <div className="app-ic"><Icon name="pin" /></div>
            <h3>Office</h3>
            <p>{address}</p>
          </div>

          {whatsapp && (
            <div className="app-card">
              <div className="app-ic"><Icon name="message" /></div>
              <h3>WhatsApp</h3>
              <p>
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontWeight: 600 }}>
                  Chat on WhatsApp ({whatsapp})
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="form-card" style={{ margin: 0, maxWidth: 'none' }}>
          {sent ? (
            <div className="empty-state" style={{ padding: '30px 10px' }}>
              <div className="emoji">✅</div>
              <h3>Thank you!</h3>
              <p className="section-sub">Your enquiry has been received. Our team will contact you shortly.</p>
              <button type="button" className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => setSent(false)}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h3 style={{ fontSize: 22 }}>Send an Enquiry</h3>
              <div className="form-row">
                <div className="field"><label>Name *</label><input className="input" required value={form.name} onChange={set('name')} /></div>
                <div className="field"><label>Phone *</label><input className="input" required value={form.phone} onChange={set('phone')} /></div>
              </div>
              <div className="field"><label>Email *</label><input className="input" type="email" required value={form.email} onChange={set('email')} /></div>
              <div className="field"><label>Company</label><input className="input" value={form.company} onChange={set('company')} /></div>
              <div className="field"><label>Message *</label><textarea className="input" rows={4} required value={form.message} onChange={set('message')} /></div>
              {error && <div className="form-error">{error}</div>}
              <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Submit Enquiry'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
