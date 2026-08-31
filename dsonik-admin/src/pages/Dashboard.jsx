import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import adminApi from '../api'
import Icon from '../components/Icons'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [adminUser, setAdminUser] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState({ show: false, type: 'success', text: '' })

  // Modal States
  const [showCatModal, setShowCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', status: 'active', displayOrder: 0 })
  const [catSubmitting, setCatSubmitting] = useState(false)

  const [showProdModal, setShowProdModal] = useState(false)
  const [prodForm, setProdForm] = useState({ name: '', category: '', price: '', modelNumber: '', description: '', status: 'active' })
  const [prodSubmitting, setProdSubmitting] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin')
      if (stored) setAdminUser(JSON.parse(stored))
    } catch (e) {}

    fetchAllData()
  }, [])

  const showToast = (text, type = 'success') => {
    setToast({ show: true, type, text })
    setTimeout(() => setToast({ show: false, type: 'success', text: '' }), 4000)
  }

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

  // Category Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!catForm.name.trim()) return

    setCatSubmitting(true)
    try {
      if (editingCat) {
        await adminApi.put(`/admin/categories/${editingCat._id}`, catForm)
        showToast(`Category "${catForm.name}" updated successfully!`)
      } else {
        await adminApi.post('/admin/categories', catForm)
        showToast(`Category "${catForm.name}" created successfully!`)
      }
      setShowCatModal(false)
      setEditingCat(null)
      setCatForm({ name: '', slug: '', description: '', status: 'active', displayOrder: 0 })
      fetchAllData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save category', 'error')
    } finally {
      setCatSubmitting(false)
    }
  }

  const openEditCat = (cat) => {
    setEditingCat(cat)
    setCatForm({
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || '',
      status: cat.status || 'active',
      displayOrder: cat.displayOrder || 0
    })
    setShowCatModal(true)
  }

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete category "${name}"?`)) return

    try {
      await adminApi.delete(`/admin/categories/${id}`)
      showToast(`Category "${name}" deleted.`)
      fetchAllData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete category', 'error')
    }
  }

  // Product Actions
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!prodForm.name.trim()) return

    setProdSubmitting(true)
    try {
      await adminApi.post('/admin/products', {
        ...prodForm,
        price: prodForm.price ? Number(prodForm.price) : 0
      })
      showToast(`Product "${prodForm.name}" added to catalog!`)
      setShowProdModal(false)
      setProdForm({ name: '', category: '', price: '', modelNumber: '', description: '', status: 'active' })
      fetchAllData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create product', 'error')
    } finally {
      setProdSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return

    try {
      await adminApi.delete(`/admin/products/${id}`)
      showToast(`Product "${name}" removed.`)
      fetchAllData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error')
    }
  }

  // Filters
  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.modelNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredInquiries = inquiries.filter(i =>
    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-layout">
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          background: toast.type === 'success' ? '#10B981' : '#EF4444',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'modal-in 0.2s ease-out'
        }}>
          <Icon name={toast.type === 'success' ? 'check' : 'close'} size={18} />
          {toast.text}
        </div>
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="brand-badge">
            <Icon name="database" size={12} />
            DSONIK CORE
          </div>
          <h2 className="brand-name">Admin Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Navigation</div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <Icon name="dashboard" size={18} />
              <span>Overview</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <Icon name="categories" size={18} />
              <span>Categories</span>
            </div>
            <span className="nav-count-badge">{categories.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <Icon name="products" size={18} />
              <span>Products</span>
            </div>
            <span className="nav-count-badge">{products.length}</span>
          </button>

          <div className="nav-section-title" style={{ marginTop: '12px' }}>Customer & Sales</div>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`nav-item ${activeTab === 'inquiries' ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <Icon name="inquiries" size={18} />
              <span>Inquiries & Leads</span>
            </div>
            {inquiries.length > 0 && <span className="nav-count-badge" style={{ background: '#FEF3C7', color: '#D97706' }}>{inquiries.length}</span>}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <Icon name="orders" size={18} />
              <span>Orders</span>
            </div>
            <span className="nav-count-badge">{orders.length}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile-pill">
            <div className="admin-avatar">
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-meta">
              <div className="admin-name">{adminUser?.name || 'DSONIK Admin'}</div>
              <div className="admin-role">Super Administrator</div>
            </div>
          </div>

          <button onClick={handleLogout} className="signout-btn">
            <Icon name="logout" size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <div className="topbar-search">
              <Icon name="search" size={16} />
              <input
                type="text"
                placeholder="Search catalog, leads, orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="topbar-right">
            <div className="live-status-pill">
              <span className="status-dot"></span>
              MongoDB Atlas Active
            </div>

            <a
              href="http://localhost:5176"
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn-outline"
            >
              <Icon name="externalLink" size={14} />
              Storefront
            </a>

            <button onClick={fetchAllData} className="action-btn-outline" title="Refresh records">
              <Icon name="refresh" size={14} />
              Sync
            </button>
          </div>
        </header>

        {/* Page Container */}
        <main className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'categories' && 'Categories Management'}
                {activeTab === 'products' && 'Product Inventory'}
                {activeTab === 'inquiries' && 'Customer Leads & Quotes'}
                {activeTab === 'orders' && 'Order Fulfillment'}
              </h1>
              <p className="page-sub">DSONIK Industrial Machinery & Ultrasonic Automation</p>
            </div>

            <div>
              {activeTab === 'categories' && (
                <button
                  onClick={() => {
                    setEditingCat(null)
                    setCatForm({ name: '', slug: '', description: '', status: 'active', displayOrder: 0 })
                    setShowCatModal(true)
                  }}
                  className="action-btn-primary"
                >
                  <Icon name="plus" size={16} />
                  Add Category
                </button>
              )}
              {activeTab === 'products' && (
                <button
                  onClick={() => setShowProdModal(true)}
                  className="action-btn-primary"
                >
                  <Icon name="plus" size={16} />
                  Add Product
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B' }}>
              <Icon name="refresh" size={32} color="#0284C7" className="animate-spin" />
              <p style={{ marginTop: '14px', fontWeight: 600 }}>Syncing live database records...</p>
            </div>
          ) : (
            <div>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-info">
                        <span className="stat-label">Total Categories</span>
                        <span className="stat-value">{categories.length}</span>
                        <span className="stat-trend">
                          <Icon name="trendingUp" size={14} />
                          Active Catalog
                        </span>
                      </div>
                      <div className="stat-icon-wrapper stat-icon-blue">
                        <Icon name="categories" size={22} />
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-info">
                        <span className="stat-label">Total Products</span>
                        <span className="stat-value">{products.length}</span>
                        <span className="stat-trend">
                          <Icon name="trendingUp" size={14} />
                          Live on Store
                        </span>
                      </div>
                      <div className="stat-icon-wrapper stat-icon-emerald">
                        <Icon name="products" size={22} />
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-info">
                        <span className="stat-label">Inquiries Received</span>
                        <span className="stat-value">{inquiries.length}</span>
                        <span className="stat-trend" style={{ color: '#D97706' }}>
                          <Icon name="inquiries" size={14} />
                          Lead Pipeline
                        </span>
                      </div>
                      <div className="stat-icon-wrapper stat-icon-amber">
                        <Icon name="inquiries" size={22} />
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-info">
                        <span className="stat-label">Total Orders</span>
                        <span className="stat-value">{orders.length}</span>
                        <span className="stat-trend" style={{ color: '#7C3AED' }}>
                          <Icon name="orders" size={14} />
                          Processed
                        </span>
                      </div>
                      <div className="stat-icon-wrapper stat-icon-purple">
                        <Icon name="orders" size={22} />
                      </div>
                    </div>
                  </div>

                  {/* System Status & Live Endpoints */}
                  <div className="content-card">
                    <div className="card-header">
                      <h3 className="card-title">Production Server & API Status</h3>
                      <span className="badge badge-active">Live Operational</span>
                    </div>
                    <div className="card-body">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>DATABASE STATUS</div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="status-dot"></span>
                            MongoDB Atlas Connected
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Database: <code>dsonik-ecommerce</code></div>
                        </div>

                        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>ACTIVE API BASE URL</div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0284C7' }}>
                            <code>{adminApi.defaults.baseURL}</code>
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Node + Express REST API</div>
                        </div>

                        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>AUTHENTICATED SESSION</div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{adminUser?.email || 'admin@dsonik.com'}</div>
                          <div style={{ fontSize: '12px', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>Role: Administrator</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Inquiries Snippet */}
                  <div className="content-card">
                    <div className="card-header">
                      <h3 className="card-title">Recent Customer Inquiries</h3>
                      <button onClick={() => setActiveTab('inquiries')} className="action-btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>
                        View All Inquiries →
                      </button>
                    </div>
                    <div className="table-responsive">
                      {inquiries.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                          No customer inquiries received yet.
                        </div>
                      ) : (
                        <table className="modern-table">
                          <thead>
                            <tr>
                              <th>Customer</th>
                              <th>Contact</th>
                              <th>Subject / Inquiry</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inquiries.slice(0, 5).map((inq) => (
                              <tr key={inq._id}>
                                <td><strong>{inq.name}</strong></td>
                                <td>
                                  <div>{inq.email}</div>
                                  <small style={{ color: '#64748B' }}>{inq.phone}</small>
                                </td>
                                <td>{inq.subject || inq.message}</td>
                                <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORIES TAB */}
              {activeTab === 'categories' && (
                <div className="content-card">
                  <div className="card-header">
                    <h3 className="card-title">All Categories ({filteredCategories.length})</h3>
                    <button
                      onClick={() => {
                        setEditingCat(null)
                        setCatForm({ name: '', slug: '', description: '', status: 'active', displayOrder: 0 })
                        setShowCatModal(true)
                      }}
                      className="action-btn-primary"
                    >
                      <Icon name="plus" size={16} />
                      Add Category
                    </button>
                  </div>
                  <div className="table-responsive">
                    {filteredCategories.length === 0 ? (
                      <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                        <Icon name="categories" size={40} color="#CBD5E1" />
                        <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: 600 }}>No categories found</p>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Click "Add Category" to create your first product category.</p>
                      </div>
                    ) : (
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>Category Name</th>
                            <th>Slug</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCategories.map((c) => (
                            <tr key={c._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon name="categories" size={18} color="#0284C7" />
                                  </div>
                                  <strong>{c.name}</strong>
                                </div>
                              </td>
                              <td><span className="code-badge">{c.slug}</span></td>
                              <td style={{ maxWidth: '300px', color: '#64748B' }}>{c.description || '—'}</td>
                              <td>
                                <span className={`badge ${c.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                                  {c.status}
                                </span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button onClick={() => openEditCat(c)} className="icon-btn" title="Edit">
                                    <Icon name="edit" size={15} />
                                  </button>
                                  <button onClick={() => handleDeleteCategory(c._id, c.name)} className="icon-btn icon-btn-danger" title="Delete">
                                    <Icon name="trash" size={15} />
                                  </button>
                                </div>
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
                <div className="content-card">
                  <div className="card-header">
                    <h3 className="card-title">Product Inventory ({filteredProducts.length})</h3>
                    <button onClick={() => setShowProdModal(true)} className="action-btn-primary">
                      <Icon name="plus" size={16} />
                      Add Product
                    </button>
                  </div>
                  <div className="table-responsive">
                    {filteredProducts.length === 0 ? (
                      <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                        <Icon name="products" size={40} color="#CBD5E1" />
                        <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: 600 }}>No products in catalog</p>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Click "Add Product" to add your industrial machinery and products.</p>
                      </div>
                    ) : (
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Model Number</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((p) => (
                            <tr key={p._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon name="products" size={18} color="#10B981" />
                                  </div>
                                  <div>
                                    <strong>{p.name}</strong>
                                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>{p.slug}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{p.category?.name || 'General'}</td>
                              <td><span className="code-badge">{p.modelNumber || 'N/A'}</span></td>
                              <td><strong>{p.price ? `₹${p.price.toLocaleString()}` : 'Quote on Request'}</strong></td>
                              <td>
                                <span className={`badge ${p.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                                  {p.status || 'active'}
                                </span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button onClick={() => handleDeleteProduct(p._id, p.name)} className="icon-btn icon-btn-danger" title="Delete">
                                    <Icon name="trash" size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* INQUIRIES TAB */}
              {activeTab === 'inquiries' && (
                <div className="content-card">
                  <div className="card-header">
                    <h3 className="card-title">Customer Leads & Quotes ({filteredInquiries.length})</h3>
                  </div>
                  <div className="table-responsive">
                    {filteredInquiries.length === 0 ? (
                      <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                        <Icon name="inquiries" size={40} color="#CBD5E1" />
                        <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: 600 }}>No leads received yet</p>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Inquiries submitted by website visitors will appear here in real-time.</p>
                      </div>
                    ) : (
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>Customer Name</th>
                            <th>Contact Information</th>
                            <th>Subject & Message</th>
                            <th>Received At</th>
                            <th>Quick Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInquiries.map((inq) => (
                            <tr key={inq._id}>
                              <td>
                                <strong>{inq.name}</strong>
                                {inq.company && <div style={{ fontSize: '12px', color: '#64748B' }}>🏢 {inq.company}</div>}
                              </td>
                              <td>
                                <div><a href={`mailto:${inq.email}`} style={{ color: '#0284C7', textDecoration: 'none' }}>{inq.email}</a></div>
                                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>📞 {inq.phone}</div>
                              </td>
                              <td style={{ maxWidth: '320px' }}>
                                <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '2px' }}>{inq.subject || 'General Inquiry'}</div>
                                <div style={{ fontSize: '12.5px', color: '#475569' }}>{inq.message}</div>
                              </td>
                              <td>{new Date(inq.createdAt).toLocaleString()}</td>
                              <td>
                                <div className="table-actions">
                                  {inq.phone && (
                                    <a
                                      href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="action-btn-outline"
                                      style={{ padding: '4px 10px', fontSize: '12px', color: '#059669', borderColor: '#A7F3D0' }}
                                    >
                                      💬 WhatsApp
                                    </a>
                                  )}
                                  <a
                                    href={`mailto:${inq.email}`}
                                    className="action-btn-outline"
                                    style={{ padding: '4px 10px', fontSize: '12px' }}
                                  >
                                    ✉️ Email
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="content-card">
                  <div className="card-header">
                    <h3 className="card-title">All Customer Orders ({orders.length})</h3>
                  </div>
                  <div className="table-responsive">
                    {orders.length === 0 ? (
                      <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                        <Icon name="orders" size={40} color="#CBD5E1" />
                        <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: 600 }}>No orders placed yet</p>
                        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Customer checkout orders will be tracked here.</p>
                      </div>
                    ) : (
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((ord) => (
                            <tr key={ord._id}>
                              <td><span className="code-badge">#{ord._id.slice(-8)}</span></td>
                              <td>{ord.customerName || ord.user?.name || 'Customer'}</td>
                              <td>{ord.items?.length || 1} Item(s)</td>
                              <td><strong>₹{(ord.totalAmount || ord.amount || 0).toLocaleString()}</strong></td>
                              <td>
                                <span className="badge badge-active">{ord.status || 'Pending'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CATEGORY MODAL */}
      {showCatModal && (
        <div className="modal-backdrop" onClick={() => setShowCatModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCat ? 'Edit Category' : 'Create New Category'}</h3>
              <button onClick={() => setShowCatModal(false)} className="modal-close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Ultrasonic Plastic Welding"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Slug (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. ultrasonic-plastic-welding"
                    value={catForm.slug}
                    onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Brief description of the machinery solutions..."
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-control"
                      value={catForm.displayOrder}
                      onChange={(e) => setCatForm({ ...catForm, displayOrder: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={catForm.status}
                      onChange={(e) => setCatForm({ ...catForm, status: e.target.value })}
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCatModal(false)} className="action-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={catSubmitting} className="action-btn-primary">
                  {catSubmitting ? 'Saving...' : (editingCat ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProdModal && (
        <div className="modal-backdrop" onClick={() => setShowProdModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Product</h3>
              <button onClick={() => setShowProdModal(false)} className="modal-close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. 20kHz Ultrasonic Welding Machine"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={prodForm.category}
                      onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Model Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. DSK-2000W"
                      value={prodForm.modelNumber}
                      onChange={(e) => setProdForm({ ...prodForm, modelNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Leave blank for 'Quote on Request'"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Machine specifications and industrial application details..."
                    value={prodForm.description}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowProdModal(false)} className="action-btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={prodSubmitting} className="action-btn-primary">
                  {prodSubmitting ? 'Saving...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
