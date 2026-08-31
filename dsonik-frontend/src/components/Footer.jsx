import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import logo from '../assets/dsonik_loogo.png'
import categoryService from '../services/categoryService'
import contactInfoService from '../services/contactInfoService'
import { extractCategories } from '../utils/helpers'

const CITIES = ['Delhi', 'Ghaziabad', 'Noida', 'Faridabad', 'Gurgaon', 'Manesar', 'Meerut', 'Sonipat']

export default function Footer() {
  const year = new Date().getFullYear()
  const [categories, setCategories] = useState([])
  const [contact, setContact] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        const [catRes, contactRes] = await Promise.all([
          categoryService.getCategories().catch(() => null),
          contactInfoService.getContactInfo().catch(() => null)
        ])
        if (isMounted) {
          if (catRes) {
            setCategories(extractCategories(catRes))
          }
          if (contactRes?.data) {
            setContact(contactRes.data)
          }
        }
      } catch (e) {
        console.error('Footer data load error:', e)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [])

  const phoneText = contact?.phoneNumbers?.join(', ') || ''
  const emailText = contact?.emailAddresses?.[0] || ''
  const addressText = contact?.officeAddress || ''
  const hoursText = contact?.workingHours || ''

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand brand-lockup" style={{ marginBottom: 14 }}>
            <img src={logo} alt="DSONIK Logo" className="brand-logo" style={{ height: '50px', width: 'auto' }} />
          </Link>
          <p>
            Manufacturer &amp; supplier of ultrasonic and plastic welding machinery — delivering
            reliable, precise and affordable welding solutions to industry for over 20 years.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><Icon name="facebook" size={16} /></a>
            <a href="#" aria-label="LinkedIn"><Icon name="linkedin" size={16} /></a>
            <a href="#" aria-label="Instagram"><Icon name="instagram" size={16} /></a>
            <a href="#" aria-label="YouTube"><Icon name="youtube" size={16} /></a>
          </div>
        </div>

        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/clients">Our Clients</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div>
          <h4>Our Products</h4>
          {categories.length > 0 ? (
            categories.map((c) => (
              <Link key={c._id || c.slug} to={`/category/${c.slug || c._id}`}>{c.name}</Link>
            ))
          ) : (
            <span style={{ fontSize: 13, color: '#94A3B8' }}>No categories listed.</span>
          )}
        </div>

        <div>
          <h4>Contact Us</h4>
          <ul className="footer-contact">
            {phoneText && <li><Icon name="phone" size={16} /> {phoneText}</li>}
            {emailText && <li><Icon name="mail" size={16} /> {emailText}</li>}
            {addressText && <li><Icon name="pin" size={16} /> {addressText}</li>}
            {hoursText && <li><Icon name="clock" size={16} /> {hoursText}</li>}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2016–{year} DSONIK Pvt. Ltd. All rights reserved.</span>
        <span style={{ maxWidth: 520, textAlign: 'right' }}>
          {CITIES.map((c, i) => (
            <React.Fragment key={c}>{i > 0 && ' | '}<a href="#" style={{ display: 'inline' }}>{c}</a></React.Fragment>
          ))}
        </span>
      </div>
    </footer>
  )
}
