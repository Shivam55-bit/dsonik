import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminApi from '../api'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [adminUser, setAdminUser] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })

  // New Category Form
  const [newCat, setNewCat] = useState({ name: '', description: '', status: 'active', displayOrder: 0 })
  const [catSubmitting, setCatSubmitting] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin')
      if (stored) setAdminUser(JSON.parse(stored))
    } catch (e) {}

    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [catsRes, prodsRes, inqRes, ordRes] = await Promise.allSettled([
        adminApi.get('/admin/categories'),
        adminApi.get('/admin/products'),
        adminApi.get('/admin/inquiries'),
        adminApi.get('/admin/orders')
      ])

      if (catsRes.status === 'fulfilled') {
        const d = catsRes.value.data
        setCategories(d.categories || d.data || [])
      }
      if (prodsRes.status === 'fulfilled') {
        const d = prodsRes.value.data
        setProducts(d.products || d.data || [])
      }
      if (inqRes.status === 'fulfilled') {
        const d = inqRes.value.data
        setInquiries(d.inquiries || d.data || [])
      }
      if (ordRes.status === 'fulfilled') {
        const d = ordRes.value.data
        setOrders(d.orders || d.data || [])
      }
    } catch (err) {
      console.error('Fetch dashboard data error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('token')
    localStorage.removeItem('isAdminLoggedIn')
    localStorage.removeItem('admin')
    navigate('/login')
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCat.name.trim()) return

    setCatSubmitting(true)
    setMsg({ type: '', text: '' })

    try {
      await adminApi.post('/admin/categories', newCat)
      setMsg({ type: 'success', text: 'Category created successfully!' })
      setNewCat({ name: '', description: '', status: 'active', displayOrder: 0 })
      fetchAllData()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create category' })
    } finally {
      setCatSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      await adminApi.delete(`/admin/categories/${id}`)
      setMsg({ type: 'success', text: `Category "${name}" deleted.` })
      fetchAllData()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete category' })
    }
  }

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sideBrand}>
          <div style={styles.brandBadge}>DSONIK</div>
          <h2 style={styles.brandTitle}>Admin Panel</h2>
        </div>

        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab('overview')}
            style={activeTab === 'overview' ? styles.navActive : styles.navBtn}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={activeTab === 'categories' ? styles.navActive : styles.navBtn}
          >
            📁 Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            style={activeTab === 'products' ? styles.navActive : styles.navBtn}
          >
            📦 Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            style={activeTab === 'inquiries' ? styles.navActive : styles.navBtn}
          >
            ✉️ Inquiries ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={activeTab === 'orders' ? styles.navActive : styles.navBtn}
          >
            🛒 Orders ({orders.length})
          </button>
        </nav>

        <div style={styles.sideFooter}>
          <div style={styles.adminInfo}>
            <div style={styles.adminAvatar}>👤</div>
            <div>
              <div style={styles.adminName}>{adminUser?.name || 'Administrator'}</div>
              <div style={styles.adminEmail}>{adminUser?.email || 'admin@dsonik.com'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'categories' && 'Manage Categories'}
              {activeTab === 'products' && 'Product Inventory'}
              {activeTab === 'inquiries' && 'Customer Inquiries'}
              {activeTab === 'orders' && 'Order Management'}
            </h1>
            <p style={styles.pageSub}>DSONIK Industrial Automation & Ultrasonic Machinery</p>
          </div>
          <button onClick={fetchAllData} style={styles.refreshBtn}>
            🔄 Refresh
          </button>
        </header>

        {msg.text && (
          <div style={msg.type === 'success' ? styles.alertSuccess : styles.alertError}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <div style={styles.loadingBox}>
            <p>Loading database records...</p>
          </div>
        ) : (
          <div>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                <div style={styles.statsGrid}>
                  <div style={{ ...styles.statCard, borderLeft: '4px solid #3B82F6' }}>
                    <div style={styles.statLabel}>Total Categories</div>
                    <div style={styles.statValue}>{categories.length}</div>
                  </div>
                  <div style={{ ...styles.statCard, borderLeft: '4px solid #10B981' }}>
                    <div style={styles.statLabel}>Active Products</div>
                    <div style={styles.statValue}>{products.length}</div>
                  </div>
                  <div style={{ ...styles.statCard, borderLeft: '4px solid #F59E0B' }}>
                    <div style={styles.statLabel}>Inquiries Received</div>
                    <div style={styles.statValue}>{inquiries.length}</div>
                  </div>
                  <div style={{ ...styles.statCard, borderLeft: '4px solid #8B5CF6' }}>
                    <div style={styles.statLabel}>Total Orders</div>
                    <div style={styles.statValue}>{orders.length}</div>
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Quick System Status</h3>
                  <div style={styles.statusRow}>
                    <span>Backend Status:</span>
                    <strong style={{ color: '#10B981' }}>● Online & Healthy</strong>
                  </div>
                  <div style={styles.statusRow}>
                    <span>Database:</span>
                    <strong style={{ color: '#10B981' }}>● MongoDB Atlas (dsonik-ecommerce)</strong>
                  </div>
                  <div style={styles.statusRow}>
                    <span>API Endpoint:</span>
                    <code>{adminApi.defaults.baseURL}</code>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'categories' && (
              <div>
                {/* Create Category Form */}
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Add New Category</h3>
                  <form onSubmit={handleCreateCategory} style={styles.formRow}>
                    <input
                      type="text"
                      required
                      placeholder="Category Name (e.g. Ultrasonic Cutters)"
                      value={newCat.name}
                      onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                      style={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newCat.description}
                      onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                      style={styles.input}
                    />
                    <button type="submit" disabled={catSubmitting} style={styles.actionBtn}>
                      {catSubmitting ? 'Creating...' : '+ Create Category'}
                    </button>
                  </form>
                </div>

                {/* Categories Table */}
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Existing Categories ({categories.length})</h3>
                  {categories.length === 0 ? (
                    <p style={{ color: '#64748B' }}>No categories created yet.</p>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Name</th>
                          <th style={styles.th}>Slug</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((c) => (
                          <tr key={c._id}>
                            <td style={styles.td}><strong>{c.name}</strong></td>
                            <td style={styles.td}><code>{c.slug}</code></td>
                            <td style={styles.td}>
                              <span style={c.status === 'active' ? styles.badgeActive : styles.badgeInactive}>
                                {c.status}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <button
                                onClick={() => handleDeleteCategory(c._id, c.name)}
                                style={styles.deleteBtn}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Product Catalog ({products.length})</h3>
                {products.length === 0 ? (
                  <p style={{ color: '#64748B' }}>No products available yet. Add products to display them on the storefront.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Product Name</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id}>
                          <td style={styles.td}><strong>{p.name}</strong></td>
                          <td style={styles.td}>{p.category?.name || 'General'}</td>
                          <td style={styles.td}>₹{p.price || 'On Request'}</td>
                          <td style={styles.td}>
                            <span style={p.status === 'active' ? styles.badgeActive : styles.badgeInactive}>
                              {p.status || 'active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* INQUIRIES TAB */}
            {activeTab === 'inquiries' && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Customer Leads & Inquiries ({inquiries.length})</h3>
                {inquiries.length === 0 ? (
                  <p style={{ color: '#64748B' }}>No customer inquiries received yet.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Contact</th>
                        <th style={styles.th}>Message</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inq) => (
                        <tr key={inq._id}>
                          <td style={styles.td}><strong>{inq.name}</strong></td>
                          <td style={styles.td}>{inq.email}<br /><small>{inq.phone}</small></td>
                          <td style={styles.td}>{inq.message || inq.subject}</td>
                          <td style={styles.td}>{new Date(inq.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Customer Orders ({orders.length})</h3>
                {orders.length === 0 ? (
                  <p style={{ color: '#64748B' }}>No orders placed yet.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Order ID</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord._id}>
                          <td style={styles.td}><code>{ord._id.slice(-6)}</code></td>
                          <td style={styles.td}>{ord.customerName || ord.user?.name || 'Customer'}</td>
                          <td style={styles.td}>₹{ord.totalAmount || ord.amount}</td>
                          <td style={styles.td}>
                            <span style={styles.badgeActive}>{ord.status || 'Pending'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F1F5F9',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif'
  },
  sidebar: {
    width: '260px',
    background: '#0F172A',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    flexShrink: 0
  },
  sideBrand: {
    marginBottom: '28px',
    paddingLeft: '8px'
  },
  brandBadge: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: '1.5px',
    marginBottom: '4px'
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: 0
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    color: '#94A3B8',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  navActive: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    background: '#1E293B',
    border: 'none',
    borderRadius: '8px',
    color: '#38BDF8',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'left',
    cursor: 'pointer'
  },
  sideFooter: {
    borderTop: '1px solid #1E293B',
    paddingTop: '16px'
  },
  adminInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px'
  },
  adminAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  },
  adminName: {
    fontSize: '13px',
    fontWeight: '600'
  },
  adminEmail: {
    fontSize: '11px',
    color: '#64748B'
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    background: '#EF4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    padding: '32px 40px',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px'
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 4px 0'
  },
  pageSub: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0
  },
  refreshBtn: {
    padding: '8px 16px',
    background: '#ffffff',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
    marginBottom: '24px'
  },
  statCard: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '500',
    marginBottom: '6px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0F172A'
  },
  card: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 0,
    marginBottom: '16px'
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #F1F5F9',
    fontSize: '14px',
    color: '#475569'
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  input: {
    flex: 1,
    minWidth: '200px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    outline: 'none'
  },
  actionBtn: {
    padding: '10px 20px',
    background: '#2563EB',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '12px 14px',
    background: '#F8FAFC',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '600',
    borderBottom: '1px solid #E2E8F0'
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #F1F5F9',
    fontSize: '13px',
    color: '#334155'
  },
  badgeActive: {
    padding: '3px 8px',
    background: '#DCFCE7',
    color: '#166534',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },
  badgeInactive: {
    padding: '3px 8px',
    background: '#F1F5F9',
    color: '#64748B',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },
  deleteBtn: {
    padding: '4px 10px',
    background: '#FEE2E2',
    color: '#B91C1C',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  loadingBox: {
    textAlign: 'center',
    padding: '60px 0',
    color: '#64748B'
  },
  alertSuccess: {
    padding: '12px 16px',
    background: '#DCFCE7',
    color: '#166534',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500'
  },
  alertError: {
    padding: '12px 16px',
    background: '#FEE2E2',
    color: '#991B1B',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500'
  }
}
