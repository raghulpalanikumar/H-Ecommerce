import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiShield,
  FiTruck,
  FiCreditCard
} from 'react-icons/fi';
import '../styles/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="modern-footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* About Section */}
          <div className="footer-column footer-about">
            <div className="footer-brand">
              <svg className="footer-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                <line x1="5" y1="18" x2="19" y2="18" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="20" r="0.5" fill="currentColor" />
              </svg>
              <h3 className="footer-brand-name">Modern Mobiles</h3>
            </div>
            <p className="footer-description">
              Your trusted destination for premium mobile accessories.
              We bring you the best quality phone cases, chargers, earphones, screen protectors, and more at great prices.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook" title="Facebook">
                <FiFacebook />
              </a>
              <a href="#" className="social-link" aria-label="Twitter" title="Twitter">
                <FiTwitter />
              </a>
              <a href="#" className="social-link" aria-label="Instagram" title="Instagram">
                <FiInstagram />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn" title="LinkedIn">
                <FiLinkedin />
              </a>
              <a href="#" className="social-link" aria-label="YouTube" title="YouTube">
                <FiYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?sortBy=rating">Best Sellers</Link></li>
              <li><Link to="/products?category=electronics">New Arrivals</Link></li>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><Link to="/dashboard">My Account</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-column">
            <h4 className="footer-heading">Customer Service</h4>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#track">Track Order</a></li>
              <li><a href="#returns">Returns & Refunds</a></li>
              <li><a href="#shipping">Shipping Information</a></li>
              <li><a href="#faq">FAQs</a></li>
              <li><a href="#contact">Contact Support</a></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="footer-column">
            <h4 className="footer-heading">Policies</h4>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#return-policy">Return Policy</a></li>
              <li><a href="#payment">Payment Policy</a></li>
              <li><a href="#security">Security</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <FiMapPin className="contact-icon" />
                <span>StarLit & Co, Annagar, Namakkal-637213</span>
              </li>
              <li>
                <FiPhone className="contact-icon" />
                <span>+91 96989 66368</span>
              </li>
              <li>
                <FiMail className="contact-icon" />
                <span>support@starlitco.com</span>
              </li>
            </ul>
            <div className="footer-hours">
              <p className="hours-title">Business Hours</p>
              <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
              <p>Sunday: 10:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="footer-features">
          <div className="feature-item">
            <FiTruck className="feature-icon" />
            <div className="feature-text">
              <strong>Free Shipping</strong>
              <span>On orders over ₹2,500</span>
            </div>
          </div>
          <div className="feature-item">
            <FiShield className="feature-icon" />
            <div className="feature-text">
              <strong>Secure Payment</strong>
              <span>100% protected</span>
            </div>
          </div>
          <div className="feature-item">
            <FiCreditCard className="feature-icon" />
            <div className="feature-text">
              <strong>Easy Returns</strong>
              <span>30-day return policy</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Modern Mobiles. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#sitemap">Sitemap</a>
              <span className="separator">•</span>
              <a href="#accessibility">Accessibility</a>
              <span className="separator">•</span>
              <a href="#careers">Careers</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;