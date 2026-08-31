import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Seo from '../components/Seo'
import ProductCard from '../components/ProductCard'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import { extractList } from '../utils/helpers'

export default function Category() {
  const { slug } = useParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState('latest')
  const [view, setView] = useState('grid')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStock, setInStock] = useState(false)

  const isAllProducts = slug === 'all'
  const title = isAllProducts
    ? 'All Products'
    : (categories.find(c => c.slug === slug || c._id === slug)?.name || decodeURIComponent(slug).replace(/-/g, ' '))

  useEffect(() => {
    let isMounted = true
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories()
        if (isMounted) {
          setCategories(extractList(res, 'categories'))
        }
      } catch (e) {
        // Fallback silently if category fetch fails
      }
    }
    fetchCats()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchProds = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = {}
        if (!isAllProducts && slug) {
          params.category = slug
        }
        const res = await productService.getProducts(params)
        if (isMounted) {
          setProducts(extractList(res, 'products'))
        }
      } catch (err) {
        if (isMounted) setError('Failed to fetch products for this category')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProds()
    return () => { isMounted = false }
  }, [slug, isAllProducts])

  const filtered = useMemo(() => {
    let list = [...products]
    if (maxPrice) list = list.filter((p) => (p.salePrice || p.discountPrice || p.price || 0) <= Number(maxPrice))
    if (inStock) list = list.filter((p) => (p.stock ?? 0) > 0)
    if (sort === 'price-asc') list.sort((a, b) => (a.price || 0) - (b.price || 0))
    if (sort === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0))
    return list
  }, [products, maxPrice, inStock, sort])

  return (
    <div className="page">
      <Seo title={`${title} — DSONIK`} description={`Browse ${title} at DSONIK — premium industrial machinery and products.`} />

      <div className="crumbs">
        <Link to="/">Home</Link> <span>/</span> <span>{title}</span>
      </div>
      <h1 className="section-title" style={{ marginBottom: 24 }}>{title}</h1>

      <div className="shop-layout">
        <aside className="filter-panel">
          <div className="filter-group">
            <h4>Categories</h4>
            <Link to="/category/all" className="filter-check" style={{ color: slug === 'all' ? 'var(--electric)' : undefined, fontWeight: slug === 'all' ? 700 : 500 }}>
              All Products
            </Link>
            {categories.map((cat) => (
              <Link key={cat._id || cat.slug} to={`/category/${cat.slug || cat._id}`} className="filter-check" style={{ color: (cat.slug === slug || cat._id === slug) ? 'var(--electric)' : undefined, fontWeight: (cat.slug === slug || cat._id === slug) ? 700 : 500 }}>
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="filter-group">
            <h4>Max Price (₹)</h4>
            <input className="input" type="number" min="0" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <div className="filter-group">
            <h4>Availability</h4>
            <label className="filter-check">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only
            </label>
          </div>
        </aside>

        <div>
          <div className="shop-toolbar">
            <span className="section-sub" style={{ margin: 0 }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="view-toggle">
                <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>▦</button>
                <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>☰</button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-grid">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 8 }} />)}</div>
          ) : error ? (
            <div className="empty-state">
              <div className="emoji">⚠️</div>
              <h3>Unable to load category</h3>
              <p className="section-sub">{error}</p>
            </div>
          ) : filtered.length ? (
            <div className="product-grid" style={view === 'list' ? { gridTemplateColumns: '1fr' } : undefined}>
              {filtered.map((p) => <ProductCard key={p._id || p.slug} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="emoji">📦</div>
              <h3>No products found</h3>
              <p className="section-sub">Try adjusting your filters or explore other categories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
