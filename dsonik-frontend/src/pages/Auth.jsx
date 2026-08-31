import React, { useState } from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import Seo from '../components/Seo'
import authService from '../services/authService'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      setLoading(true)
      const data = await authService.login({ email, password })
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      <h2>Welcome back</h2>
      <p className="muted" style={{ marginTop: 0 }}>Sign in to manage orders and quotes.</p>
      <div className="field">
        <label>Email</label>
        <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>Password</label>
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: 12, cursor: 'pointer' }}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input className="input" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <div className="form-error">{error}</div>}
      <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
      <p className="muted" style={{ textAlign: 'center', marginBottom: 0 }}>
        New to DSONIK? <Link to="/auth/register" style={{ color: 'var(--electric-2)' }}>Create an account</Link>
      </p>
    </form>
  )
}

function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess('')
    try {
      setLoading(true)
      const data = await authService.register(form)
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      setSuccess('Account created successfully! Redirecting to dashboard...')
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      <h2>Create account</h2>
      <p className="muted" style={{ marginTop: 0 }}>Join DSONIK to order and request quotes.</p>
      <div className="field"><label>Full name</label><input className="input" required value={form.name} onChange={set('name')} /></div>
      <div className="field"><label>Email</label><input className="input" type="email" required value={form.email} onChange={set('email')} /></div>
      <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
      <div className="field">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>Password</label>
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: 12, cursor: 'pointer' }}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input className="input" type={showPassword ? 'text' : 'password'} required minLength={6} value={form.password} onChange={set('password')} />
      </div>
      {success && <div style={{ background: '#DCFCE7', color: '#166534', padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 12 }}>{success}</div>}
      {error && <div className="form-error">{error}</div>}
      <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
      <p className="muted" style={{ textAlign: 'center', marginBottom: 0 }}>
        Already registered? <Link to="/auth/login" style={{ color: 'var(--electric-2)' }}>Sign in</Link>
      </p>
    </form>
  )
}

export default function Auth() {
  return (
    <div className="auth-shell">
      <Seo title="Account — DSONIK" />
      <div className="auth-card">
        <Link to="/" className="brand" style={{ marginBottom: 20 }}>
          <span>DSONIK</span>
        </Link>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </div>
  )
}
