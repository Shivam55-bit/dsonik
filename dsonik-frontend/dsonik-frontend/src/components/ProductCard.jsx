import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import ResolvedImage from './ResolvedImage'
import cartService from '../services/cartService'

export default function ProductCard({ product, tag }) {
  const rawImg = (product.images && product.images[0]) || product.image || ''

  const category = typeof product.category === 'object'
    ? product.category?.name
    : (typeof product.category === 'string' ? product.category : '')
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  const addToCart = async (e) => {
    e.preventDefault()
    if (!localStorage.getItem('token')) {
      window.location.assign('/auth/login')
      return
    }
    try {
      await cartService.addToCart({ productId: product._id, quantity: 1 })
      alert('Product added to your cart!')
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Unable to add product to cart')
    }
  }

  return (
    <article className="product-card">
      <div className="product-thumb">
        <Link to={`/product/${product.slug || product._id}`} className="product-thumb-link" aria-label={`View ${product.name}`}>
          <ResolvedImage value={rawImg} alt={product.name} loading="lazy" />
        </Link>
        {tag && <span className="product-tag">{tag}</span>}
        <button className="product-wish" title="Add to wishlist" onClick={(e) => e.preventDefault()} aria-label="Add to wishlist"><Icon name="heart" size={17} /></button>
      </div>
      <div className="product-body">
        {category && <span className="product-cat">{category}</span>}
        <Link to={`/product/${product.slug || product._id}`} className="product-name">{product.name}</Link>
        <div className="product-price">
          {product.price ? (
            <>
              ₹{(hasDiscount ? product.discountPrice : product.price).toLocaleString('en-IN')}
              {hasDiscount && <small style={{ textDecoration: 'line-through', marginLeft: 8 }}>₹{product.price.toLocaleString('en-IN')}</small>}
            </>
          ) : (
            <small>Request Quote</small>
          )}
        </div>
        <div className="product-actions">
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={addToCart}>Add to Cart</button>
          <Link to={`/product/${product.slug || product._id}`} className="btn btn-outline btn-sm">View</Link>
        </div>
      </div>
    </article>
  )
}
