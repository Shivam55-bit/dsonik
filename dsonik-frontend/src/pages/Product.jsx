import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import ResolvedImage from '../components/ResolvedImage'
import productService from '../services/productService'
import cartService from '../services/cartService'
import { resolveImageUrl } from '../utils/helpers'

export default function Product() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('description')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
    let mounted = true
    setLoading(true)
    setError(null)
    productService.getProductBySlug(slug)
      .then((res) => {
        if (mounted) {
          const prodData = res.data || res.product || res
          setProduct(prodData)
        }
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.message || 'Product not found')
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [slug])

  const requireAuth = () => {
    if (!localStorage.getItem('token')) {
      navigate('/auth/login')
      return false
    }
    return true
  }

  const addToCart = async () => {
    if (!requireAuth()) return
    try {
      setAdding(true)
      await cartService.addToCart({ productId: product._id, quantity: 1 })
      alert('Product added to your cart!')
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally { setAdding(false) }
  }

  const buyNow = async () => {
    if (!requireAuth()) return
    try {
      await cartService.addToCart({ productId: product._id, quantity: 1 })
      navigate('/checkout')
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    }
  }

  if (loading) return <div className="page"><div className="spinner" /></div>
  if (error || !product) {
    return (
      <div className="page empty-state">
        <div className="emoji">🔍</div>
        <h3>Product not found</h3>
        <p className="section-sub">{error || 'The product you requested is not available.'}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back Home</Link>
      </div>
    )
  }

  const specs = product.specifications && typeof product.specifications === 'object'
    ? Object.entries(product.specifications) : []
  const hasDiscount = (product.salePrice > 0 || product.discountPrice > 0) &&
    (product.salePrice < product.price || product.discountPrice < product.price)
  const activePrice = product.salePrice > 0 ? product.salePrice : (product.discountPrice > 0 ? product.discountPrice : product.price)
  const displayImage = resolveImageUrl(product.images?.[0] || product.image)

  return (
    <div className="page">
      <Seo
        title={`${product.seoTitle || product.name} — DSONIK`}
        description={product.seoDescription || product.shortDescription || product.name}
        image={displayImage}
        type="product"
      />

      <div className="crumbs">
        <Link to="/">Home</Link> <span>/</span>
        <Link to="/category/all">Products</Link> <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="detail-grid">
        <div className="gallery-main">
          <ResolvedImage value={displayImage} alt={product.name} placeholder="No image available" />
        </div>

        <div>
          {product.isFeatured && <span className="product-tag" style={{ position: 'static', display: 'inline-block', marginBottom: 12 }}>Best Seller</span>}
          <h1 className="section-title" style={{ fontSize: 32 }}>{product.name}</h1>
          <div className="detail-price">
            {typeof product.price === 'number' && product.price > 0 ? (
              <>
                ₹{activePrice.toLocaleString('en-IN')}
                {hasDiscount && <span style={{ fontSize: 18, color: 'var(--muted)', textDecoration: 'line-through', marginLeft: 12 }}>₹{product.price.toLocaleString('en-IN')}</span>}
              </>
            ) : (
              <span style={{ color: 'var(--electric)' }}>Request Quote</span>
            )}
          </div>
          <p className="section-sub" style={{ margin: '0 0 20px' }}>{product.shortDescription || 'Premium industrial-grade machinery engineered for reliability.'}</p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <button className="btn btn-primary" onClick={addToCart} disabled={adding}>{adding ? 'Adding…' : 'Add to Cart'}</button>
            <button className="btn btn-dark" onClick={buyNow}>Buy Now</button>
          </div>

          <div style={{ display: 'flex', gap: 20, color: 'var(--muted)', fontSize: 14, flexWrap: 'wrap' }}>
            <span>✅ {(product.stock ?? 0) > 0 ? 'In stock' : 'Made to order'}</span>
            <span>🚚 Pan-India delivery</span>
            <span>🛡️ 2-year warranty</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'description' ? 'active' : ''}`} onClick={() => setTab('description')}>Description</button>
        {specs.length > 0 && <button className={`tab ${tab === 'specs' ? 'active' : ''}`} onClick={() => setTab('specs')}>Specifications</button>}
        {product.features?.length > 0 && <button className={`tab ${tab === 'features' ? 'active' : ''}`} onClick={() => setTab('features')}>Features</button>}
      </div>

      <div style={{ maxWidth: 900 }}>
        {tab === 'description' && (
          <div dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription || 'No detailed description available.' }} />
        )}
        {tab === 'specs' && (
          <table className="spec-table">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{String(v)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'features' && (
          <ul>{product.features?.map((f, i) => <li key={i} style={{ padding: '6px 0' }}>✔ {f}</li>)}</ul>
        )}
      </div>

      {/* Inquiry CTA */}
      <div className="cta-band reveal in" style={{ marginTop: 48, padding: 40 }}>
        <h2 style={{ fontSize: 26 }}>Need bulk pricing or a custom configuration?</h2>
        <p>Send us an inquiry and our engineers will respond with a tailored quote.</p>
        <div className="cta-actions">
          <Link to="/contact" className="btn btn-primary">Request a Quote</Link>
        </div>
      </div>
    </div>
  )
}
