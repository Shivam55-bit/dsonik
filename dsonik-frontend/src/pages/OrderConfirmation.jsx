import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Seo from '../components/Seo'
import orderService from '../services/orderService'

export default function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let mounted = true
    orderService.getOrder(id)
      .then((res) => {
        if (mounted) setOrder(res.data || res.order || res)
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true)
      const blob = await orderService.downloadInvoice(id)
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${order?.orderNumber || id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      alert('Failed to download invoice')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="page"><div className="spinner" /></div>
  if (!order) return <div className="page empty-state"><div className="emoji">🔍</div><h3>Order not found</h3><Link to="/" className="btn btn-primary">Back Home</Link></div>

  const items = order.products || order.items || []
  const grandTotal = order.grandTotal || order.totalAmount || 0

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <Seo title="Order Confirmed — DSONIK" />

      <div className="empty-state" style={{ padding: '32px 20px 12px' }}>
        <div className="emoji">✅</div>
        <h1 className="section-title">Order Confirmed!</h1>
        <p className="section-sub">Thank you — we've received your order and our team will be in touch shortly.</p>
      </div>

      <div className="summary" style={{ position: 'static' }}>
        <div className="summary-row"><span>Order Number</span><span style={{ fontWeight: 700, color: 'var(--text)' }}>#{order.orderNumber || String(order._id).slice(-8).toUpperCase()}</span></div>
        <div className="summary-row"><span>Status</span><span className={`status-badge status-${order.orderStatus}`}>{order.orderStatus}</span></div>
        <div className="summary-row"><span>Payment</span><span>{(order.paymentMethod || 'COD').toUpperCase()} · {order.paymentStatus}</span></div>

        <h3 style={{ fontSize: 18, margin: '20px 0 8px' }}>Items</h3>
        {items.map((p, idx) => (
          <div key={p._id || idx} className="summary-row"><span>{p.name} × {p.quantity}</span><span>₹{(p.price * p.quantity).toLocaleString('en-IN')}</span></div>
        ))}
        {order.shippingCharge > 0 ? <div className="summary-row"><span>Shipping Charge</span><span>₹{order.shippingCharge.toLocaleString('en-IN')}</span></div> : null}
        <div className="summary-row total"><span>Total Amount</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={handleDownloadInvoice} disabled={downloading}>
          {downloading ? 'Downloading...' : '📄 Download Invoice PDF'}
        </button>
        <Link to="/" className="btn btn-outline">Continue Shopping</Link>
      </div>
    </div>
  )
}
