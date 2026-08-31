import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../api'

function isTokenExpired(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.exp) return false
    const now = Math.floor(Date.now() / 1000)
    return payload.exp <= now
  } catch (e) {
    return true
  }
}

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true'
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token')

    if (isAdminLoggedIn) {
      setStatus('ok')
      return
    }

    if (!token) {
      setStatus('no')
      return
    }

    if (isTokenExpired(token)) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('token')
      localStorage.removeItem('isAdminLoggedIn')
      setStatus('no')
      return
    }

    let mounted = true
    api.get('/api/auth/profile')
      .then(res => {
        if (!mounted) return
        if (res.data && res.data.role === 'admin') {
          localStorage.setItem('isAdminLoggedIn', 'true')
          setStatus('ok')
        } else {
          setStatus('no')
        }
      })
      .catch(() => {
        if (mounted) setStatus('no')
      })

    return () => { mounted = false }
  }, [])

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748B', fontSize: 15, fontWeight: 500 }}>
        Verifying admin session...
      </div>
    )
  }

  if (status === 'no') {
    return <Navigate to="/login" replace />
  }

  return children
}
