import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiShoppingCart, FiHeart, FiLoader,
  FiPackage, FiTruck, FiShield, FiCornerUpLeft, FiInfo, FiChevronRight
} from 'react-icons/fi';
import { useCart } from '../context/cartContext';
import { useWishlist } from '../context/wishlistContext';
import { useNotification } from '../context/notificationContext';
import { useAuth } from '../context/authContext';
import ProductImage from '../components/ProductImage';
import StockBadge from '../components/StockBadge';
import ReviewsSection from '../components/ReviewsSection';
import { formatPrice } from '../utils/helpers';
import { api } from '../utils/api';
import '../styles/product-detail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError } = useNotification();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewEligibility, setReviewEligibility] = useState({ isEligible: false, orderId: null });
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // Parallel fetch for product and reviews
      const [productData, reviewsData] = await Promise.all([
        api.getProduct(id),
        api.getProductReviews(id)
      ]);

      if (productData.success) {
        setProduct(productData.data.product);
        setReviews(reviewsData || []);
      }

      // If user logged in, check review eligibility
      if (user) {
        const reviewable = await api.getReviewableProducts();
        const matchingItem = reviewable.find(item => (item.product._id || item.product) === id);
        if (matchingItem) {
          setReviewEligibility({ isEligible: true, orderId: matchingItem.orderId });
        } else {
          setReviewEligibility({ isEligible: false, orderId: null });
        }
      }
    } catch (err) {
      setError(err.message || 'Technical disruption during product retrieval.');
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    try {
      await addToCartContext({ ...product, id: product._id || product.id }, 1);
      showSuccess('Product added to your procurement cycle');
    } catch (err) {
      showError('Cart synchronization failed.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) return (
    <div className="product-detail-page flex justify-center items-center">
      <div style={{ textAlign: 'center' }}>
        <FiLoader className="animate-spin" size={48} color="#0066cc" />
        <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Retreiving Product Intel...</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="product-detail-page text-center">
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '40px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <FiInfo size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h2 style={{ margin: 0, color: '#0f172a' }}>{error || 'Catalog Entry Not Found'}</h2>
        <p style={{ color: '#64748b', margin: '16px 0 24px' }}>The requested unit is currently unavailable in our global repository.</p>
        <button onClick={() => navigate('/products')} className="btn-procure" style={{ width: '100%' }}><FiArrowLeft /> Back to Catalog</button>
      </div>
    </div>
  );

  return (
    <div className="product-detail-page">
      <div className="container">
        <nav className="product-path">
          <Link to="/">Home</Link> <FiChevronRight size={12} />
          <Link to="/products">Catalog</Link> <FiChevronRight size={12} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{product.category}</span>
        </nav>

        <div className="product-layout">
          {/* Left: Product Visuals */}
          <div className="product-visuals">
            <ProductImage product={product} />
          </div>

          {/* Right: Product Intel */}
          <div className="product-intel">
            <div>
              <span className="product-category-badge">{product.category}</span>
              <h1 className="product-main-title">{product.name}</h1>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                <StockBadge stock={product.stock} />
                <span style={{ color: '#94a3b8' }}>•</span>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>REF: {String(product._id).toUpperCase().slice(-12)}</span>
              </div>
            </div>

            <div className="product-valuation">
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Market Valuation</div>
                <div className="current-valuation">{formatPrice(product.price)}</div>
              </div>
              {product.originalPrice && (
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '1.1rem' }}>{formatPrice(product.originalPrice)}</div>
                  <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.9rem' }}>Enterprise Discount Applied</div>
                </div>
              )}
            </div>

            <div style={{ padding: '20px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700 }}>Product Description</h4>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>{product.description}</p>
            </div>

            <div className="procurement-actions">
              <div className="primary-actions-row">
                <button className="btn-procure" onClick={handleAddToCart} disabled={product.stock <= 0 || isAddingToCart}>
                  {isAddingToCart ? 'Syncing...' : (product.stock > 0 ? <><FiShoppingCart /> Add to Procurement</> : 'Out of Inventory')}
                </button>
                <button
                  className={`btn-wish-toggle ${isInWishlist(product._id) ? 'active' : ''}`}
                  onClick={() => isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)}
                >
                  <FiHeart fill={isInWishlist(product._id) ? '#ef4444' : 'none'} size={24} />
                </button>
              </div>
              <button className="btn-buy-instant" onClick={() => navigate('/checkout', { state: { buyNowItem: { ...product, quantity: 1 } } })} disabled={product.stock <= 0}>
                Initiate Secure One-Click Checkout
              </button>
            </div>

            <div className="specs-registry">
              <div className="spec-item">
                <div className="spec-icon"><FiTruck /></div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>Dispatch</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>24-Hour Express</div>
                </div>
              </div>
              <div className="spec-item">
                <div className="spec-icon"><FiShield /></div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>Warranty</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>12-Month Coverage</div>
                </div>
              </div>
              <div className="spec-item">
                <div className="spec-icon"><FiPackage /></div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>Condition</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Brand New Hub</div>
                </div>
              </div>
              <div className="spec-item">
                <div className="spec-icon"><FiCornerUpLeft /></div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>Returns</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>7-Day Guarantee</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Review Vault */}
        <div className="reviews-vault">
          <ReviewsSection
            reviews={reviews}
            productName={product.name}
            isEligible={reviewEligibility.isEligible}
            orderId={reviewEligibility.orderId}
            productId={product._id}
            onReviewSubmitted={loadData}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
