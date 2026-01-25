import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiArrowRight
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { api } from '../utils/api';
import Carousel from '../components/Carousel';
import Image from '../components/Image';
import '../styles/home.css';
import '../styles/features.css';
import '../styles/categories.css';
import '../styles/featured-products.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await api.getProducts();

        // Get top-rated products as featured
        const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const categories = [
    {
      name: 'Phone Cases',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80',
      link: '/products?category=cases'
    },
    {
      name: 'Chargers & Cables',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
      link: '/products?category=chargers'
    },
    {
      name: 'Audio Accessories',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
      link: '/products?category=audio'
    },
    {
      name: 'Screen Protectors',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      link: '/products?category=screen-protectors'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Carousel */}
      <Carousel
        slides={[
          {
            image:
              'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1600&auto=format&fit=crop',
            badge: 'New Arrivals',
            title: 'Premium Phone Cases & Covers',
            subtitle: 'Protect your device in style with our latest collection of durable and stylish cases.',
            primaryCta: { href: '/products?category=cases', label: 'Shop Cases' },
            secondaryCta: { href: '/products?sortBy=rating', label: 'Best Sellers' },
          },
          {
            image:
              'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1600&auto=format&fit=crop',
            badge: 'Fast Charging',
            title: 'Chargers & Power Banks',
            subtitle: 'Never run out of battery with our high-speed chargers and portable power solutions.',
            primaryCta: { href: '/products?category=chargers', label: 'Shop Chargers' },
            secondaryCta: { href: '/products', label: 'View All' },
          },
          {
            image:
              'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1600&auto=format&fit=crop',
            badge: 'Premium Audio',
            title: 'Wireless Earbuds & Headphones',
            subtitle: 'Experience crystal-clear sound with our premium audio accessories.',
            primaryCta: { href: '/products?category=audio', label: 'Shop Audio' },
            secondaryCta: { href: '/products?sortBy=rating', label: 'Top Rated' },
          },
        ]}
      />


      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card feature-card-1">
              <div className="feature-icon">
                <FiShield size={32} />
              </div>
              <h3>100% Authentic</h3>
              <p>Original branded mobile accessories guaranteed</p>
            </div>
            <div className="feature-card feature-card-2">
              <div className="feature-icon">
                <FiTruck size={32} />
              </div>
              <h3>Fast Delivery</h3>
              <p>Quick delivery across India within 2-5 days</p>
            </div>
            <div className="feature-card feature-card-3">
              <div className="feature-icon">
                <FiHeadphones size={32} />
              </div>
              <h3>Warranty Support</h3>
              <p>6-12 months warranty on all products</p>
            </div>
            <div className="feature-card feature-card-4">
              <div className="feature-icon">
                <FiShoppingBag size={32} />
              </div>
              <h3>Easy Returns</h3>
              <p>7-day return policy for damaged items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Find the perfect accessories for your mobile device</p>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="category-card"
              >
                <div className="category-image-container">
                  <Image
                    src={category.image}
                    alt={category.name}
                    className="category-image"
                    fallback="/assets/no-image-placeholder.svg"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <span className="shop-now">
                    Shop now <FiArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Discover our best-selling mobile accessories</p>
          </div>

          {loading ? (
            <div className="products-loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/products" className="btn-view-all">
              Explore All Products
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }} className="py-16 text-white">
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '250px',
          height: '250px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ marginBottom: '1rem' }}>Stay Updated</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9, fontSize: '1.125rem' }} className="mt-2 opacity-90">
            Subscribe to our newsletter for the latest deals and product updates
          </p>
          <form
            style={{ display: 'flex', justifyContent: 'center', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input rounded-md"
              style={{
                flex: 1,
                padding: '0.875rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <button
              type="submit"
              className="btn btn-secondary"
              style={{
                background: 'white',
                color: '#0066cc',
                border: 'none',
                padding: '0.875rem 2rem',
                borderRadius: '12px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f9ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;