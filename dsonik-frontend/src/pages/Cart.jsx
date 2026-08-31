import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import cartService from '../services/cartService'
import { resolveImageUrl } from '../utils/helpers'

export default function Cart() {
  const [cartData, setCartData] = useState({ items: [], subtotal: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const navigate = useNavigate()

  const fetchCart = async () => {
    try {
      setLoading(true)
      const res = await cartService.getCart()
      const data = res.data || res || { items: [] }
      setCartData({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        total: data.total || data.subtotal || 0
      })
    } catch (err) {
      // Cart fetch fail handling
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth/login')
      return
    }
    fetchCart()
  }, [])

  const updateQty = async (itemId, productId, currentQty, delta) => {
    const newQty = currentQty + delta
    if (newQty < 0) return
    try {
      setUpdatingId(itemId || productId)
      if (newQty === 0) {
        await cartService.removeCartItem(itemId || productId)
      } else {
        await cartService.updateCart({ itemId: itemId || productId, productId, quantity: newQty })
      }
      await fetchCart()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const removeItem = async (itemId) => {
    try {
      setUpdatingId(itemId)
      await cartService.removeCartItem(itemId)
      await fetchCart()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        setLoading(true)
        await cartService.clearCart()
        await fetchCart()
      } catch (err) {
        alert(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading) return <div className="page"><div className="spinner" /></div>

  const items = cartData.items || []
  const subtotal = cartData.subtotal || items.reduce((s, i) => s + (i.price * i.quantity), 0)
  const shippingCharge = subtotal > 5000 ? 0 : (subtotal > 0 ? 250 : 0)
  const grandTotal = subtotal + shippingCharge

  return (
    <div className="page">
      <Seo title="Your Cart — DSONIK" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="section-title" style={{ margin: 0 }}>Your Cart</h1>
        {items.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={handleClearCart} style={{ color: '#ef4444' }}>
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🛒</div>
          <h3>Your cart is empty</h3>
          <p className="section-sub">Explore our premium machinery and add products to get started.</p>
          <Link to="/category/all" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {items.map((i) => {
              const productId = i.product?._id || i.product || i.productId
              const itemImg = resolveImageUrl(i.image || i.product?.images?.[0])
              const isUpdating = updatingId === i._id || updatingId === productId

              return (
                <div key={i._id || productId} className="cart-item" style={{ opacity: isUpdating ? 0.6 : 1 }}>
                  <div className="cart-thumb">
                    {itemImg ? <img src={itemImg} alt={i.name} /> : <span style={{ color: 'var(--silver-2)' }}>—</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{i.name || i.product?.name}</div>
                    <div className="section-sub" style={{ margin: '2px 0 0' }}>₹{(i.price || 0).toLocaleString('en-IN')} each</div>
                  </div>
                  <div className="qty">
                    <button onClick={() => updateQty(i._id, productId, i.quantity, -1)} disabled={isUpdating} aria-label="Decrease">−</button>
                    <input value={i.quantity} readOnly />
                    <button onClick={() => updateQty(i._id, productId, i.quantity, 1)} disabled={isUpdating} aria-label="Increase">+</button>
                  </div>
                  <div style={{ fontWeight: 800, minWidth: 90, textAlign: 'right' }}>₹{((i.price || 0) * i.quantity).toLocaleString('en-IN')}</div>
                  <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b', marginLeft: 8 }} onClick={() => removeItem(i._id || productId)} disabled={isUpdating}>Remove</button>
                </div>
              )
            })}
          </div>

          <aside className="summary">
            <h3 style={{ fontSize: 20 }}>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge.toLocaleString('en-IN')}`}</span></div>
            <div className="summary-row total"><span>Grand Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
            <Link to="/category/all" className="btn btn-outline btn-block" style={{ marginTop: 10 }}>Continue Shopping</Link>
          </aside>
        </div>
      )}
    </div>
  )
}
