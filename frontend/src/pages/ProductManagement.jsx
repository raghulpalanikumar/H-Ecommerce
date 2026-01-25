import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { api } from '../utils/api';
import { formatPrice } from '../utils/helpers';
import { constructImageUrl } from '../utils/imageUtils';
import '../styles/admin.css';

const ProductManagement = () => {
  // ... existing state ...
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    stock: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 30000); // 30s to make it visible
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      showNotification('error', 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { name, price, category, description, image, stock } = formData;
    if (!name.trim()) return 'Product name is required';
    if (!price || parseFloat(price) < 0) return 'Valid price is required';
    if (!category) return 'Category is required';
    if (!description.trim()) return 'Description is required';
    if (!image.trim()) return 'Image URL is required';
    if (!stock || parseInt(stock) < 0) return 'Valid stock quantity is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      showNotification('error', validationError);
      return;
    }
    setSubmitting(true);
    try {
      const productData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct._id || editingProduct.id, productData);
        showNotification('success', 'Product updated successfully!');
      } else {
        await api.addProduct(productData);
        showNotification('success', 'Product added successfully!');
      }

      await loadProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('error', error.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      image: product.image,
      stock: product.stock.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Delete product "${productName}"?`)) {
      try {
        await api.deleteProduct(productId);
        await loadProducts();
        showNotification('success', 'Product deleted.');
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('error', 'Failed to delete.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category: '', description: '', image: '', stock: '' });
    setEditingProduct(null);
    setShowModal(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['electronics', 'clothing', 'books', 'home', 'sports', 'other'];

  return (
    <div className="admin-products-page">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`admin-notification ${notification.type}`} style={{
          position: 'fixed', top: '2rem', right: '2rem', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: '12px', background: notification.type === 'success' ? '#10b981' : '#f43f5e',
          color: 'white', fontWeight: '600', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          {notification.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          {notification.message}
        </div>
      )}

      <header className="admin-header-bar">
        <div>
          <h1>Product Management</h1>
          <p style={{ color: '#64748b' }}>Maintain your catalog and inventory levels</p>
        </div>
        <button onClick={() => setShowModal(true)} className="admin-btn-primary">
          <FiPlus /> <span>New Product</span>
        </button>
      </header>

      {/* Control Bar */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-body" style={{ padding: '1.25rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '400px' }}>
              <input
                type="text"
                placeholder="Find items by name or category..."
                className="auth-input" // Reusing modern input style
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '3rem', background: '#f8fafc' }}
              />
              <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>
              Displaying {filteredProducts.length} entries
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: '0' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner"></div></div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product Model</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Inventory</th>
                    <th>Operational Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id || product.id}>
                      <td style={{ minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                            <img
                              src={constructImageUrl(product.image)}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmOGZhZmMiLz48L3N2Zz4='; }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{product.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>REF: {String(product._id || product.id).toUpperCase().slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge badge-blue">{product.category}</span>
                      </td>
                      <td style={{ fontWeight: '700', color: '#0f172a' }}>
                        {formatPrice(product.price)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: product.stock < 10 ? '#ef4444' : '#10b981' }}></div>
                          <span style={{ fontWeight: '600' }}>{product.stock} units</span>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge badge-${(product.stock ?? 0) > 0 ? 'green' : 'red'}`}>
                          {(product.stock ?? 0) > 0 ? 'Active Hub' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(product)} className="admin-quick-btn" style={{ padding: '0.5rem', borderRadius: '8px' }}>
                            <FiEdit style={{ color: '#0066cc' }} />
                          </button>
                          <button onClick={() => handleDelete(product._id || product.id, product.name)} className="admin-quick-btn" style={{ padding: '0.5rem', borderRadius: '8px' }}>
                            <FiTrash2 style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={resetForm}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-input"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL *</label>
                <input
                  type="url"
                  name="image"
                  className="form-input"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                />
                {formData.image && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--gray-200)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting
                  ? (editingProduct ? 'Updating...' : 'Adding...')
                  : (editingProduct ? 'Update Product' : 'Add Product')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;