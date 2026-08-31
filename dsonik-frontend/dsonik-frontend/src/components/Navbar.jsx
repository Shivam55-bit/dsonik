import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon'
import ResolvedImage from './ResolvedImage'
import logo from '../assets/dsonik_loogo.png'
import categoryService from '../services/categoryService'
import contactInfoService from '../services/contactInfoService'
import { extractCategories, resolveCategoryImage } from '../utils/helpers'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false)
  const [q, setQ] = useState('')
  const [categories, setCategories] = useState([])
  const [contact, setContact] = useState(null)
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    setToken(t)
    try {
      const u = localStorage.getItem('user')
      setUser(u && u !== 'undefined' ? JSON.parse(u) : null)
    } catch (e) {
      setUser(null)
    }
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
  }, [drawer])

  useEffect(() => {
    let isMounted = true
    const fetchNavData = async () => {
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
        console.error('Navbar load error:', e)
      }
    }
    fetchNavData()
    return () => { isMounted = false }
  }, [])

  const phone = contact?.phoneNumbers?.[0] || ''
  const email = contact?.emailAddresses?.[0] || ''

  const search = (e) => {
    e.preventDefault()
    const term = q.trim()
    if (!term) return
    navigate(`/category/all?q=${encodeURIComponent(term)}`)
    setDrawer(false)
  }

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header-top">
        <div className="site-header-top-inner">
          <div className="site-header-contact">
            {phone && (
              <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`}>
                <Icon name="phone" size={14} /> <span>{phone}</span>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`}>
                <Icon name="mail" size={14} /> <span>{email}</span>
              </a>
            )}
          </div>
          <div className="site-header-top-links">
            <Link to="/about">About Us</Link>
            <Link to="/clients">Our Clients</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>

      <div className="site-header-main">
        <div className="site-header-container">
          <Link to="/" className="site-header-logo" aria-label="DSONIK Home">
            <img src={logo} alt="DSONIK Logo" />
          </Link>

          <nav className="site-header-nav" aria-label="Main Navigation">
            <Link to="/">Home</Link>

            <div
              className={`site-header-products ${productsOpen ? 'is-open' : ''}`}
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button
                type="button"
                className="site-header-products-trigger"
                aria-expanded={productsOpen}
                onClick={() => setProductsOpen((open) => !open)}
              >
                Products <Icon name="chevronDown" size={14} />
              </button>
              {categories.length > 0 && (
                <div
                  className="site-header-products-menu"
                  style={productsOpen ? {
                    opacity: 1,
                    visibility: 'visible',
                    pointerEvents: 'auto',
                    transform: 'translate(-50%, 0)'
                  } : undefined}
                >
                  <Link to="/category/all" className="site-header-products-all" onClick={() => setProductsOpen(false)}>
                    View all products
                  </Link>
                  {categories.map((category) => {
                    const image = resolveCategoryImage(category)
                    return (
                      <Link
                        key={category._id || category.slug}
                        to={`/category/${category.slug || category._id}`}
                        className="site-header-product-link"
                        onClick={() => setProductsOpen(false)}
                      >
                        <span className="site-header-product-media">
                          <ResolvedImage value={image} alt="" className="site-header-product-image" placeholder="" />
                        </span>
                        <span className="site-header-product-copy">
                          <span className="site-header-product-title">{category.name}</span>
                          <span className="site-header-product-description">{category.description || 'View products'}</span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            <Link to="/about">About Us</Link>
            <Link to="/clients">Clients</Link>
            <Link to="/contact">Contact Us</Link>
          </nav>

          <div className="site-header-actions">
            <form onSubmit={search} className="site-header-search" role="search">
              <Icon name="search" size={16} className="search-ic" />
              <input
                type="search"
                placeholder="Search machines..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search machines"
              />
            </form>

            <Link to="/cart" className="site-header-action" aria-label="Shopping Cart">
              <Icon name="cart" size={20} />
            </Link>

            <Link to={token ? '/cart' : '/auth'} className="site-header-action" aria-label="Account">
              <Icon name="user" size={20} />
            </Link>

            <button
              type="button"
              className="site-header-menu-button"
              onClick={() => setDrawer(true)}
              aria-label="Open Mobile Menu"
            >
              <Icon name="menu" size={22} />
            </button>
          </div>
        </div>
      </div>

      {drawer && (
        <div className="site-header-mobile-backdrop" onClick={() => setDrawer(false)}>
          <div className="site-header-mobile" onClick={(e) => e.stopPropagation()}>
            <div className="site-header-mobile-head">
              <img src={logo} alt="DSONIK Logo" />
              <button type="button" className="site-header-mobile-close" onClick={() => setDrawer(false)} aria-label="Close Mobile Menu">
                <Icon name="x" size={24} />
              </button>
            </div>

            <form onSubmit={search} className="site-header-mobile-search">
              <input
                type="search"
                placeholder="Search machines..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button type="submit"><Icon name="search" size={18} /></button>
            </form>

            <nav className="site-header-mobile-links">
              <Link to="/" onClick={() => setDrawer(false)}>Home</Link>
              <button type="button" onClick={() => setMobileProductsOpen((open) => !open)} aria-expanded={mobileProductsOpen}>
                Products <Icon name="chevronDown" size={16} />
              </button>
              {mobileProductsOpen && (
                <div className="site-header-mobile-products">
                  <Link to="/category/all" onClick={() => setDrawer(false)}>All Products</Link>
                  {categories.map((category) => (
                    <Link key={category._id || category.slug} to={`/category/${category.slug || category._id}`} onClick={() => setDrawer(false)}>
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              <Link to="/about" onClick={() => setDrawer(false)}>About Us</Link>
              <Link to="/clients" onClick={() => setDrawer(false)}>Our Clients</Link>
              <Link to="/contact" onClick={() => setDrawer(false)}>Contact Us</Link>
              <Link to="/cart" onClick={() => setDrawer(false)}>My Cart</Link>
              <Link to={token ? '/cart' : '/auth'} onClick={() => setDrawer(false)}>
                {token ? (user?.name ? `Account (${user.name.split(' ')[0]})` : 'My Account') : 'Login / Register'}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
