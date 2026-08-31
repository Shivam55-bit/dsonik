import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import orderService from '../services/orderService'

export default function Checkout() {
  const navigate = useNavigate()
  const [shipping, setShipping] = useState({ name: '', email: '', phone: '', line1: '', city: '', state: '', zip: '', country: 'India' })
  const [billingSame, setBillingSame] = useState(true)
  const [billing, setBilling] = useState({ line1: '', city: '', state: '', zip: '', country: 'India' })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth/login')
      return
    }
    const savedUserStr = localStorage.getItem('user')
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr)
        setShipping(prev => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
          phone: u.phone || prev.phone
        }))
      } catch (e) {}
    }
  }, [])

  const set = (obj, setter) => (key) => (e) => setter({ ...obj, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const payload = {
        shippingAddress: shipping,
        billingAddress: billingSame ? shipping : billing,
        paymentMethod: paymentMethod.toLowerCase(),
      }
      const res = await orderService.createOrder(payload)
      const orderId = res.data?._id || res.order?._id || res._id
      if (orderId) {
        navigate(`/order/${orderId}`)
      } else {
        navigate('/')
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally { setLoading(false) }
  }

  const s = set(shipping, setShipping)
  const b = set(billing, setBilling)

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <Seo title="Checkout — DSONIK" />
      <h1 className="section-title" style={{ marginBottom: 24 }}>Checkout</h1>

      <form onSubmit={submit}>
        <fieldset className="card-fieldset">
          <legend>Shipping Address</legend>
          <div className="form-row">
            <div className="field"><label>Full name</label><input className="input" required value={shipping.name} onChange={s('name')} /></div>
            <div className="field"><label>Phone</label><input className="input" required value={shipping.phone} onChange={s('phone')} /></div>
          </div>
          <div className="field"><label>Email</label><input className="input" type="email" required value={shipping.email} onChange={s('email')} /></div>
          <div className="field"><label>Address</label><input className="input" required value={shipping.line1} onChange={s('line1')} /></div>
          <div className="form-row">
            <div className="field"><label>City</label><input className="input" required value={shipping.city} onChange={s('city')} /></div>
            <div className="field"><label>State</label><input className="input" required value={shipping.state} onChange={s('state')} /></div>
          </div>
          <div className="form-row">
            <div className="field"><label>ZIP / PIN</label><input className="input" required value={shipping.zip} onChange={s('zip')} /></div>
            <div className="field"><label>Country</label><input className="input" value={shipping.country} onChange={s('country')} /></div>
          </div>
        </fieldset>

        <label className="filter-check" style={{ margin: '4px 0 16px' }}>
          <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} /> Billing address same as shipping
        </label>

        {!billingSame && (
          <fieldset className="card-fieldset">
            <legend>Billing Address</legend>
            <div className="field"><label>Address</label><input className="input" value={billing.line1} onChange={b('line1')} /></div>
            <div className="form-row">
              <div className="field"><label>City</label><input className="input" value={billing.city} onChange={b('city')} /></div>
              <div className="field"><label>State</label><input className="input" value={billing.state} onChange={b('state')} /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>ZIP / PIN</label><input className="input" value={billing.zip} onChange={b('zip')} /></div>
              <div className="field"><label>Country</label><input className="input" value={billing.country} onChange={b('country')} /></div>
            </div>
          </fieldset>
        )}

        <fieldset className="card-fieldset">
          <legend>Payment Method</legend>
          <label className="filter-check"><input type="radio" name="pm" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on Delivery</label>
          <label className="filter-check"><input type="radio" name="pm" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} /> Online Payment</label>
        </fieldset>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Placing order…' : 'Place Order'}
        </button>
      </form>
    </div>
  )
}
