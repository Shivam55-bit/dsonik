import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import adminApi from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await adminApi.post('/auth/login/admin', {
        email: email.trim().toLowerCase(),
        password: password
      })

      const token = res.data?.token || res.data?.data?.token
      const user = res.data?.data?.user || res.data?.user

      if (token) {
        localStorage.setItem('adminToken', token)
        localStorage.setItem('admin_token', token)
        localStorage.setItem('token', token)
        localStorage.setItem('isAdminLoggedIn', 'true')
        if (user) {
          localStorage.setItem('admin', JSON.stringify(user))
        }

        navigate('/')
      } else {
        setError('Login failed: Token not received')
      }
    } catch (err) {
      console.error('Admin login error:', err)
      const msg = err.response?.data?.message || err.message || 'Invalid email or password'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const fillDefaultCredentials = () => {
    setEmail('admin@dsonik.com')
    setPassword('Admin@123')
    setError('')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandHeader}>
          <div style={styles.badge}>DSONIK INDUSTRIAL</div>
          <h1 style={styles.title}>Admin Control Center</h1>
          <p style={styles.subtitle}>Sign in to manage catalog, orders & system settings</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Admin Email</label>
            <input
              type="email"
              required
              placeholder="admin@dsonik.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.passwordHeader}>
              <label style={styles.label}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showPassBtn}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
          </button>
        </form>

        <div style={styles.credentialsBox}>
          <div style={styles.credText}>
            <strong>Default Admin:</strong> <code>admin@dsonik.com</code> | <code>Admin@123</code>
          </div>
          <button
            type="button"
            onClick={fillDefaultCredentials}
            style={styles.fillBtn}
          >
            Auto Fill
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
    padding: '20px',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '36px 32px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    background: '#EFF6FF',
    color: '#2563EB',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    marginBottom: '10px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 6px 0'
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0
  },
  errorAlert: {
    padding: '12px 14px',
    background: '#FEF2F2',
    border: '1px solid #F87171',
    borderRadius: '8px',
    color: '#991B1B',
    fontSize: '13px',
    marginBottom: '18px',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155'
  },
  showPassBtn: {
    background: 'none',
    border: 'none',
    color: '#2563EB',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    width: '100%'
  },
  submitBtn: {
    marginTop: '6px',
    padding: '12px',
    background: '#2563EB',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.2s',
    boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
  },
  credentialsBox: {
    marginTop: '22px',
    padding: '12px',
    background: '#F8FAFC',
    borderRadius: '8px',
    border: '1px dashed #CBD5E1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  credText: {
    fontSize: '12px',
    color: '#475569'
  },
  fillBtn: {
    background: '#E2E8F0',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#1E293B',
    cursor: 'pointer'
  }
}
