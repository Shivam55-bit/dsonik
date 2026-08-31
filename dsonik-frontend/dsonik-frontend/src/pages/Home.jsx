import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import Icon from '../components/Icon'
import ResolvedImage from '../components/ResolvedImage'
import useReveal from '../hooks/useReveal'
import Banner1 from '../assets/Banner1.png'
import Banner2 from '../assets/Banner2.png'
import Banner3 from '../assets/Banner3.png'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import bannerService, { extractBanners } from '../services/bannerService'
import testimonialService from '../services/testimonialService'
import achievementService from '../services/achievementService'
import faqService from '../services/faqService'
import inquiryService from '../services/inquiryService'
import { extractCategories, extractList, resolveCategoryImage, resolveImageUrl } from '../utils/helpers'

const DEFAULT_BANNERS = [
  {
    _id: 'default-1',
    title: 'We Deliver Results',
    subtitle: 'Precision welding machines trusted by 950+ manufacturers.',
    description: 'High performance industrial welding equipment built for B2B manufacturing.',
    tag: 'Ultrasonic Plastic Welding',
    desktopImage: Banner1,
    mobileImage: '',
    buttonOneText: 'Explore Machines',
    buttonOneLink: '/category/all',
    buttonTwoText: 'Enquire Now',
    buttonTwoLink: '#enquiry',
    overlayOpacity: 0.45,
    textAlignment: 'left'
  },
  {
    _id: 'default-2',
    title: 'High Strength Jointing',
    subtitle: 'Engineered for maximum repeatable industrial quality.',
    description: 'Advanced spin and ultrasonic joining technology for demanding assembly lines.',
    tag: 'Spin & Rotary Welding',
    desktopImage: Banner2,
    mobileImage: '',
    buttonOneText: 'Explore Machines',
    buttonOneLink: '/category/all',
    buttonTwoText: 'Enquire Now',
    buttonTwoLink: '#enquiry',
    overlayOpacity: 0.45,
    textAlignment: 'left'
  },
  {
    _id: 'default-3',
    title: 'Engineered For Precision',
    subtitle: 'On-site commissioning, operator training, and dedicated support.',
    description: 'Tailored turnkey plastic welding systems built to your specs.',
    tag: 'Custom B2B Solutions',
    desktopImage: Banner3,
    mobileImage: '',
    buttonOneText: 'Contact Us',
    buttonOneLink: '/contact',
    buttonTwoText: 'Enquire Now',
    buttonTwoLink: '#enquiry',
    overlayOpacity: 0.45,
    textAlignment: 'left'
  }
]

export default function Home() {
  const [q, setQ] = useState('')
  const [bannerSlide, setBannerSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const [banners, setBanners] = useState(DEFAULT_BANNERS)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [achievements, setAchievements] = useState([])
  const [faqs, setFaqs] = useState([])
  const [achievementCounts, setAchievementCounts] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Hero Enquiry Modal State
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Hero Section Enquiry',
    message: '',
    source: 'hero'
  })
  const [enquiryStatus, setEnquiryStatus] = useState({ loading: false, success: '', error: '' })

  const navigate = useNavigate()
  const reveal = useReveal()
  const achievementRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [catRes, prodRes, bannerRes, testRes, achRes, faqRes] = await Promise.all([
          categoryService.getCategories().catch(() => null),
          productService.getProducts().catch(() => null),
          bannerService.getBanners().catch(() => null),
          testimonialService.getTestimonials().catch(() => null),
          achievementService.getAchievements().catch(() => null),
          faqService.getFaqs().catch(() => null)
        ])

        if (isMounted) {
          setCategories(extractCategories(catRes))

          const rawProducts = prodRes
            ? (prodRes.products || prodRes.data?.products || prodRes.data?.data || prodRes.data || (Array.isArray(prodRes) ? prodRes : []))
            : []

          const activeProducts = rawProducts.filter(
            (product) =>
              product.status === 'active' ||
              product.status === true ||
              product.isActive === true ||
              !product.status
          )

          const featuredProducts = activeProducts.filter(
            (product) =>
              product.isFeatured === true ||
              product.featured === true
          )

          const homeProducts = featuredProducts.length > 0 ? featuredProducts : activeProducts

          console.log('Products API response:', prodRes)
          console.log('Active products:', activeProducts)
          console.log('Home products:', homeProducts)

          setProducts(homeProducts.slice(0, 6))

          const fetchedBanners = extractBanners(bannerRes)
          if (fetchedBanners.length > 0) setBanners(fetchedBanners)

          const fetchedTestimonials = extractList(testRes, 'testimonials')
          setTestimonials(fetchedTestimonials)

          const rawAchievements = achRes
            ? (achRes.achievements || achRes.data?.achievements || achRes.data?.data || achRes.data || (Array.isArray(achRes) ? achRes : []))
            : []

          const activeAchievements = rawAchievements
            .filter((item) =>
              item.status === 'active' ||
              item.status === true ||
              item.isActive === true ||
              !item.status
            )
            .sort(
              (a, b) =>
                Number(a.displayOrder || a.order || 0) -
                Number(b.displayOrder || b.order || 0)
            )

          console.log('Achievements API response:', achRes)
          console.log('Active achievements:', activeAchievements)

          setAchievements(activeAchievements)
          setAchievementCounts(activeAchievements.map(() => 0))

          const fetchedFaqs = extractList(faqRes, 'faqs')
          setFaqs(fetchedFaqs)
        }
      } catch (err) {
        if (isMounted) setError('Failed to load data. Please check server connection.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [])

  // Auto Slider Timer with Pause on Hover
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return
    const timer = setInterval(() => {
      setBannerSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners, isPaused])

  useEffect(() => {
    if (!achievements.length) return
    const node = achievementRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry.isIntersecting) return

        const duration = 1400
        const start = performance.now()
        let rafId = null

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setAchievementCounts(achievements.map((item) => Math.round((item.value || 0) * eased)))
          if (progress < 1) rafId = requestAnimationFrame(tick)
        }

        rafId = requestAnimationFrame(tick)
        observer.disconnect()
        return () => cancelAnimationFrame(rafId)
      },
      { threshold: 0.25 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [achievements])

  const search = (e) => {
    e.preventDefault()
    if (q.trim()) navigate(`/category/all?q=${encodeURIComponent(q.trim())}`)
  }

  const currentBanner = banners[bannerSlide] || banners[0] || {}

  const handleEnquiryClick = (e, link) => {
    if (link === '#enquiry') {
      e.preventDefault()
      setEnquiryModalOpen(true)
    }
  }

  const handleEnquirySubmit = async (e) => {
    e.preventDefault()
    setEnquiryStatus({ loading: true, success: '', error: '' })
    try {
      await inquiryService.sendInquiry(enquiryForm)
      setEnquiryStatus({ loading: false, success: 'Your enquiry has been submitted successfully!', error: '' })
      setEnquiryForm({ name: '', email: '', phone: '', subject: 'Hero Section Enquiry', message: '', source: 'hero' })
      setTimeout(() => setEnquiryModalOpen(false), 2000)
    } catch (err) {
      setEnquiryStatus({ loading: false, success: '', error: err.response?.data?.message || 'Unable to submit enquiry' })
    }
  }

  return (
    <div ref={reveal}>
      <Seo
        title="DSONIK — Ultrasonic & Plastic Welding Machines | Your Technology Partner"
        description="DSONIK manufactures & supplies ultrasonic plastic welding, spin, impulse, hot-plate and vibration welding machines for automotive, packaging, medical and electronics industries."
      />

      {/* HERO SLIDER SECTION */}
      <section
        className="hero"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          '--hero-overlay-opacity': currentBanner.overlayOpacity ?? 0.45
        }}
      >
        <div className="hero-banner-slider" aria-hidden="true">
          {banners.map((banner, index) => {
            const deskSrc = typeof banner.desktopImage === 'string' && (banner.desktopImage.startsWith('/') || banner.desktopImage.startsWith('http'))
              ? resolveImageUrl(banner.desktopImage)
              : banner.desktopImage
            const mobSrc = banner.mobileImage
              ? resolveImageUrl(banner.mobileImage)
              : ''

            return (
              <picture key={banner._id || index} className={`hero-banner-slide ${index === bannerSlide ? 'active' : ''}`}>
                {mobSrc && <source media="(max-width: 767px)" srcSet={mobSrc} />}
                <img
                  src={deskSrc}
                  alt={banner.title || 'DSONIK Hero Banner'}
                  onError={(event) => { event.currentTarget.style.visibility = 'hidden' }}
                />
              </picture>
            )
          })}
        </div>

        <div className="hero-banner-overlay" style={{ opacity: currentBanner.overlayOpacity ?? 0.45 }} />
        <div className="hero-grid-bg" />

        <div className="hero-inner slider">
          <div className={`hero-content hero-content--${currentBanner.textAlignment || 'left'}`}>
            {currentBanner.tag && <span className="slide-tag">{currentBanner.tag}</span>}

            <h1 className="hero-title">
              {currentBanner.title ? (
                <span className="accent">{currentBanner.title}</span>
              ) : (
                <>We <span className="accent">Deliver Results</span></>
              )}
            </h1>

            <p className="hero-desc">{currentBanner.subtitle || 'Precision welding machines trusted by 950+ manufacturers.'}</p>
            {currentBanner.description && (
              <p className="hero-subdesc" style={{ fontSize: 14, opacity: 0.85, marginTop: -8, marginBottom: 16 }}>
                {currentBanner.description}
              </p>
            )}

            <form className="hero-search" onSubmit={search}>
              <Icon name="search" size={20} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search welding machines, generators, horns..." aria-label="Search products" />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <div className="hero-actions" style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link to={currentBanner.buttonOneLink || '/category/all'} className="btn btn-primary">
                {currentBanner.buttonOneText || 'Explore Machines'}
              </Link>
              <Link
                to={currentBanner.buttonTwoLink || '#enquiry'}
                className="btn btn-ghost"
                onClick={(e) => handleEnquiryClick(e, currentBanner.buttonTwoLink || '#enquiry')}
              >
                {currentBanner.buttonTwoText || 'Enquire Now'}
              </Link>
            </div>

            {/* Slider Controls */}
            {banners.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 28 }}>
                <button
                  type="button"
                  onClick={() => setBannerSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                  aria-label="Previous slide"
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ‹
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBannerSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      style={{
                        width: idx === bannerSlide ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        border: 'none',
                        background: idx === bannerSlide ? '#6366F1' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setBannerSlide((prev) => (prev + 1) % banners.length)}
                  aria-label="Next slide"
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="feature-strip" aria-label="Service features">
        <div className="container">
          <div className="feature-strip-grid">
            <div className="feature-strip-item">
              <span className="feature-strip-icon"><Icon name="truck" size={26} /></span>
              <div className="feature-strip-text">
                <h3>Quick Delivery</h3>
                <p>Most product are free shipping.</p>
              </div>
            </div>
            <div className="feature-strip-item">
              <span className="feature-strip-icon"><Icon name="creditCard" size={26} /></span>
              <div className="feature-strip-text">
                <h3>Pay with Easy</h3>
                <p>Most product are free shipping.</p>
              </div>
            </div>
            <div className="feature-strip-item">
              <span className="feature-strip-icon"><Icon name="handshake" size={26} /></span>
              <div className="feature-strip-text">
                <h3>Best Deal</h3>
                <p>Most product are free shipping.</p>
              </div>
            </div>
            <div className="feature-strip-item">
              <span className="feature-strip-icon"><Icon name="shield" size={26} /></span>
              <div className="feature-strip-text">
                <h3>Secured Payment</h3>
                <p>Most product are free shipping.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section categories-section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="tech-showcase reveal">
            <aside className="tech-showcase-aside">
              <span className="tech-showcase-eyebrow">01 — Our Technology</span>
              <h2 className="tech-showcase-title">
                Explore by
                <br />
                Technology
              </h2>
              <span className="tech-showcase-arrow" aria-hidden="true">→</span>
              <p className="tech-showcase-desc">
                We offer high-performance solutions across multiple plastic welding techniques.
              </p>
              <Link to="/category/all" className="tech-showcase-cta">
                See All Products
                <span aria-hidden="true">→</span>
              </Link>
            </aside>

            {categories.length > 0 ? (
              <div className="tech-showcase-panels">
                {categories.map((cat, idx) => {
                  const catSlug = cat.slug || cat._id || `cat-${idx}`
                  const catImage = resolveCategoryImage(cat)
                  const panelNum = String(idx + 1).padStart(2, '0')
                  return (
                    <Link key={catSlug} to={`/category/${catSlug}`} className="tech-panel">
                      <div className="tech-panel-image">
                        <ResolvedImage
                          value={catImage}
                          alt={cat.name}
                          className="category-card-image"
                          loading="lazy"
                        />
                      </div>
                      <span className="tech-panel-num">{panelNum}</span>
                      <div className="tech-panel-content">
                        <h3>{cat.name}</h3>
                        <p>{cat.description || 'High precision plastic welding equipment.'}</p>
                        <span className="tech-panel-btn">
                          Learn More <Icon name="arrowRight" size={16} />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="tech-showcase-empty reveal" style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
                <p style={{ fontSize: 16, fontWeight: 500 }}>No categories available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="section products-showcase-section">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Our Products</span>
            <h2 className="section-title">Best Selling Machines</h2>
            <p className="section-sub">Reliable welding machines chosen by leading manufacturers.</p>
          </div>

          {loading ? (
            <div className="products-showcase-state reveal">
              <div className="products-showcase-state-card">
                <p>Loading products from server...</p>
              </div>
            </div>
          ) : error ? (
            <div className="products-showcase-state reveal">
              <div className="products-showcase-state-card error">
                <p>{error}</p>
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="products-showcase-grid reveal">
              {products.map((product, idx) => {
                const image = resolveImageUrl(product.images?.[0] || product.image)
                const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || '')
                const detailHref = `/product/${product.slug || product._id}`
                const hasPrice = typeof product.price === 'number' && product.price > 0
                const priceValue = hasPrice ? `₹${product.price.toLocaleString('en-IN')}` : 'Request Quote'
                const fallbackRating = 3.8 + ((idx % 6) * 0.18)
                const ratingValue = Number(product.rating ?? fallbackRating)
                const safeRating = Number.isFinite(ratingValue) ? Math.min(Math.max(ratingValue, 0), 5) : fallbackRating
                const starText = '★'.repeat(Math.round(safeRating))
                const ratingLabel = safeRating % 1 === 0 ? String(safeRating) : safeRating.toFixed(1)

                return (
                  <article key={product._id || product.slug} className="products-showcase-card">
                    <Link to={detailHref} className="products-showcase-media" aria-label={`View ${product.name}`}>
                      {product.isFeatured && <span className="products-showcase-badge">Best Seller</span>}
                      <ResolvedImage value={image} alt={product.name} loading="lazy" />
                    </Link>
                    <div className="products-showcase-body">
                      {categoryName && <span className="products-showcase-category">{categoryName}</span>}
                      <Link to={detailHref} className="products-showcase-title">{product.name}</Link>
                      <p className="products-showcase-description">{product.shortDescription || product.description || 'Premium industrial welding machine.'}</p>
                      <div className="products-showcase-rating" aria-label={`${ratingLabel} out of 5 stars`}>
                        <span className="products-showcase-stars">{starText}</span>
                        <span className="products-showcase-rating-count">({ratingLabel})</span>
                      </div>
                      <div className="products-showcase-meta">
                        <span className="products-showcase-price">{priceValue}</span>
                        <span className="products-showcase-availability">{product.stock > 0 ? 'In stock' : 'Made to order'}</span>
                      </div>
                      <div className="products-showcase-actions">
                        <Link to={detailHref} className="btn btn-primary btn-sm">View Details</Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="products-showcase-state reveal">
              <div className="products-showcase-state-card empty">
                <div className="products-showcase-state-icon">📦</div>
                <h3>No products available yet</h3>
                <p>New product listings will appear here once added in admin panel.</p>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/category/all" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="section achievement-section" ref={achievementRef}>
        <div className="container achievement-container">
          <div className="section-head reveal achievement-head">
            <span className="eyebrow achievement-eyebrow">OUR GLOBAL ACHIEVEMENTS</span>
            <h2 className="section-title achievement-title">Delivering Excellence Across The Globe</h2>
            <div className="title-divider">
              <span className="line"></span>
              <span className="dot"></span>
              <span className="line"></span>
            </div>
          </div>

          {loading ? (
            <div className="reveal" style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
              <p>Loading achievements...</p>
            </div>
          ) : achievements.length === 0 ? (
            <div className="reveal" style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
              <p className="empty-message">Achievement statistics will appear here soon.</p>
            </div>
          ) : (
            <div className="achievement-grid reveal">
              {achievements.map((item, idx) => {
                const displayVal = achievementCounts[idx] !== undefined ? achievementCounts[idx] : item.value
                const suffixVal = item.suffix !== undefined ? item.suffix : '+'
                const iconName = item.icon || 'globe'

                return (
                  <div key={item._id || item.title || idx} className="achievement-card">
                    <span className="achievement-icon"><Icon name={iconName} size={20} /></span>
                    <strong className="achievement-value">{displayVal}{suffixVal}</strong>
                    <div className="achievement-line"></div>
                    <span className="achievement-label">{item.title || item.name || item.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Testimonials</span>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>
          {testimonials.length > 0 ? (
            <div className="testi-grid reveal">
              {testimonials.map((t) => (
                <div key={t._id || t.name} className="testi-card">
                  <div className="testi-stars">{'★'.repeat(t.rating || 5)}</div>
                  <p>“{t.message}”</p>
                  <div className="testi-who">
                    {t.image ? (
                      <ResolvedImage value={t.image} alt={t.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div className="testi-av">{t.initials || t.name.charAt(0)}</div>
                    )}
                    <div>
                      <b>{t.name}</b>
                      <span>{[t.designation, t.company].filter(Boolean).join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="reveal" style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
              <p style={{ fontSize: 15, fontWeight: 500 }}>No testimonials available.</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Support</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          {faqs.length > 0 ? (
            <div className="faq-list reveal">
              {faqs.map((f, i) => (
                <div key={f._id || i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    {f.question} <span className="ic">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  <div className="faq-a"><p style={{ margin: 0 }}>{f.answer}</p></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="reveal" style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
              <p style={{ fontSize: 15, fontWeight: 500 }}>No FAQs available.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-band reveal">
            <h2>Ready to Weld Smarter?</h2>
            <p>Talk to our engineers today and get a tailored quotation for your welding requirement.</p>
            <div className="cta-actions">
              <Link to="/contact" className="btn btn-primary">Enquire Now</Link>
              <Link to="/contact" className="btn btn-ghost">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* HERO ENQUIRY MODAL */}
      {enquiryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFF', borderRadius: 20, maxWidth: 500, width: '100%', padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>Enquire Now</h3>
              <button type="button" onClick={() => setEnquiryModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>

            {enquiryStatus.success && <div style={{ background: '#DCFCE7', color: '#166534', padding: 12, borderRadius: 8, marginBottom: 12 }}>{enquiryStatus.success}</div>}
            {enquiryStatus.error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: 12, borderRadius: 8, marginBottom: 12 }}>{enquiryStatus.error}</div>}

            <form onSubmit={handleEnquirySubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Full Name *</label>
                <input required className="form-input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }} value={enquiryForm.name} onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Email *</label>
                  <input required type="email" className="form-input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }} value={enquiryForm.email} onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Phone *</label>
                  <input required className="form-input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }} value={enquiryForm.phone} onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Message *</label>
                <textarea required rows={3} className="form-input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1' }} value={enquiryForm.message} onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })} placeholder="Tell us about your welding requirement..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEnquiryModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={enquiryStatus.loading}>
                  {enquiryStatus.loading ? 'Submitting...' : 'Submit Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
