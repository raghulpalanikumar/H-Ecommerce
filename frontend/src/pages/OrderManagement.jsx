import React, { useState, useEffect } from 'react';
import { FiEye, FiFilter, FiRefreshCw, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { api } from '../utils/api';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';
import { constructImageUrl } from '../utils/imageUtils';
import '../styles/admin.css';

const OrderManagement = () => {
  // ... existing state ...
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await api.getOrders(filters);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (window.confirm(`Update order status to "${newStatus}"?`)) {
      try {
        setError(null);
        await api.updateOrderStatus(orderId, newStatus);
        await loadOrders(true);
      } catch (error) {
        console.error('Error updating status:', error);
        setError(error.message || 'Update failed.');
      }
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleRefresh = () => loadOrders(true);

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
  };

  if (loading && !refreshing) return <div style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner"></div></div>;

  return (
    <div className="admin-orders-page">
      <header className="admin-header-bar">
        <div>
          <h1>Order Fulfillment</h1>
          <p style={{ color: '#64748b' }}>Monitor and manage customer transactions</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleRefresh} disabled={refreshing} className="admin-btn-primary" style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0' }}>
            <FiRefreshCw className={refreshing ? 'loading' : ''} /> <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
          <div style={{ position: 'relative' }}>
            <select
              className="auth-input"
              style={{ minWidth: '180px', paddingLeft: '2.5rem', background: '#fff' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All States</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <FiFilter style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>
      </header>

      {/* Operation Stats */}
      <section className="admin-stats-container" style={{ marginBottom: '2rem' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#fff7ed', color: '#f59e0b' }}><FiPackage /></div>
          <div className="admin-stat-info"><h3>Pending</h3><p>{stats.pending}</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><FiRefreshCw /></div>
          <div className="admin-stat-info"><h3>Active</h3><p>{stats.processing}</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}><FiCheckCircle /></div>
          <div className="admin-stat-info"><h3>Completed</h3><p>{stats.delivered}</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon icon-revenue"><FiDollarSign /></div>
          <div className="admin-stat-info"><h3>Period Rev</h3><p>{formatPrice(stats.totalRevenue)}</p></div>
        </div>
      </section>

      {/* Main Registry */}
      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: '0' }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer Identity</th>
                  <th>Timestamp</th>
                  <th>Quantity</th>
                  <th>Total Value</th>
                  <th>Phase</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id || order._id}>
                    <td style={{ fontWeight: '700', color: '#0066cc' }}>#{(order.id || order._id)?.toString().slice(-8).toUpperCase()}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{order.userName || order.user?.name || 'Guest'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.userEmail || order.user?.email || 'N/A'}</div>
                    </td>
                    <td>{formatDate(order.date || order.createdAt)}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td style={{ fontWeight: '600' }}>{formatPrice(order.total || 0)}</td>
                    <td>
                      <span className={`admin-badge badge-${getStatusColor(order.status) === 'primary' ? 'blue' : (getStatusColor(order.status) === 'success' ? 'green' : (getStatusColor(order.status) === 'danger' ? 'red' : 'orange'))}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleViewOrder(order)} className="admin-quick-btn" style={{ padding: '0.5rem', borderRadius: '8px' }}>
                          <FiEye style={{ color: '#3b82f6' }} />
                        </button>
                        <select
                          className="auth-input"
                          style={{ minWidth: '100px', fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '32px' }}
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id || order._id, e.target.value)}
                        >
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                Order #{(selectedOrder.id || selectedOrder._id)?.toString().slice(-8)} Details
              </h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
                <div>
                  <h4>Customer Information</h4>
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Name:</strong> {selectedOrder.userName || selectedOrder.user?.name || 'Unknown User'}<br />
                    <strong>Email:</strong> {selectedOrder.userEmail || selectedOrder.user?.email || 'No email'}<br />
                    <strong>Order Date:</strong> {formatDate(selectedOrder.date || selectedOrder.createdAt)}<br />
                    <strong>Status:</strong> <span className={`badge badge-${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4>Order Summary</h4>
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Items:</strong> {selectedOrder.items?.length || selectedOrder.products?.length || 0}<br />
                    <strong>Total:</strong> {formatPrice(selectedOrder.total || 0)}<br />
                    {selectedOrder.shippingAddress && (
                      <>
                        <strong>Shipping Address:</strong><br />
                        <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                          {selectedOrder.shippingAddress.address}<br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br />
                          {selectedOrder.shippingAddress.country}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <h4>Order Items</h4>
              <div style={{ marginTop: '1rem' }}>
                {(selectedOrder.items || selectedOrder.products || []).map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--border-radius)',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong>{item.name || item.product?.name || 'Unknown Item'}</strong><br />
                      <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                        Quantity: {item.quantity} × {formatPrice(item.price || 0)}
                      </span>
                      {item.image && (
                        <div style={{ width: '50px', height: '50px', marginRight: '1rem', flexShrink: 0 }}>
                          <img
                            src={constructImageUrl(item.image)}
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                      {formatPrice((item.price || 0) * (item.quantity || 0))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--gray-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Total:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {formatPrice(selectedOrder.total || 0)}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Close
              </button>
              <button
                onClick={() => {
                  const newStatus = prompt('Enter new status (pending, processing, shipped, delivered, cancelled):');
                  if (newStatus && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(newStatus)) {
                    handleStatusUpdate(selectedOrder.id || selectedOrder._id, newStatus);
                    setShowModal(false);
                  }
                }}
                className="btn btn-primary"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;