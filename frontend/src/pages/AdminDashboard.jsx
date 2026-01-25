import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiUsers, FiShoppingCart, FiDollarSign, FiTrendingUp, FiDownload, FiRefreshCw, FiPieChart } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { api } from '../utils/api';
import { formatPrice, formatDate, getStatusColor } from "../utils/helpers";
import { constructImageUrl } from '../utils/imageUtils';
import '../styles/admin.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadAnalytics();
    const intervalId = setInterval(() => {
      loadAnalytics();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.getAnalytics();
      const normalized = data && typeof data === 'object' && 'data' in data ? data.data : data;
      setAnalytics(normalized);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('AdminDashboard: Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFallbackImage = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 50; canvas.height = 50;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0, 0, 50, 50);
      return canvas.toDataURL();
    } catch {
      return 'data:image/gif;base64,R0lGODdhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
    }
  };

  const downloadExcelReport = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Products', analytics?.totalProducts || 0],
        ['Total Orders', analytics?.totalOrders || 0],
        ['Total Users', analytics?.totalUsers || 0],
        ['Total Revenue', analytics?.totalRevenue || 0]
      ];
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');
      XLSX.writeFile(workbook, `admin-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) { alert('Export failed'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner"></div>
      <p>Loading Modern Mobiles Ecosystem...</p>
    </div>
  );

  if (!analytics) return <div className="text-center p-4">Error loading data.</div>;

  const salesByMonth = analytics.salesByMonth || [];
  const salesByCategory = analytics.salesByCategory || [];

  return (
    <div className="admin-dashboard">
      <header className="admin-header-bar">
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Synchronized with live data as of {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={downloadExcelReport} className="admin-btn-primary" style={{ background: '#10b981' }}>
            <FiDownload /> <span>Export Report</span>
          </button>
          <button onClick={loadAnalytics} className="admin-btn-primary">
            <FiRefreshCw /> <span>Sync Data</span>
          </button>
        </div>
      </header>

      {/* Stats Cards Grid */}
      <section className="admin-stats-container">
        <div className="admin-stat-card">
          <div className="admin-stat-icon icon-products"><FiPackage /></div>
          <div className="admin-stat-info">
            <h3>Total Inventory</h3>
            <p>{analytics.totalProducts || 0}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon icon-orders"><FiShoppingCart /></div>
          <div className="admin-stat-info">
            <h3>Customer Orders</h3>
            <p>{analytics.totalOrders || 0}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon icon-users"><FiUsers /></div>
          <div className="admin-stat-info">
            <h3>Platform Users</h3>
            <p>{analytics.totalUsers || 0}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon icon-revenue"><FiDollarSign /></div>
          <div className="admin-stat-info">
            <h3>Gross Revenue</h3>
            <p>{formatPrice(analytics.totalRevenue || 0)}</p>
          </div>
        </div>
      </section>

      {/* Shortcuts Row */}
      <div className="admin-card" style={{ marginBottom: '2.5rem' }}>
        <div className="admin-card-header">
          <h2>Administrative Shortcuts</h2>
        </div>
        <div className="admin-card-body">
          <div className="admin-quick-grid">
            <Link to="/admin/products" className="admin-quick-btn">
              <FiPackage style={{ color: '#3b82f6' }} /> <span>Manage Products</span>
            </Link>
            <Link to="/admin/orders" className="admin-quick-btn">
              <FiShoppingCart style={{ color: '#ec4899' }} /> <span>Fulfill Orders</span>
            </Link>
            <Link to="/admin/users" className="admin-quick-btn">
              <FiUsers style={{ color: '#22c55e' }} /> <span>Audit Users</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Data Visualization Row */}
      <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Revenue Analysis</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setChartType('line')}
                className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'btn-secondary'}`}
              >Trend</button>
              <button
                onClick={() => setChartType('bar')}
                className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
              >Volume</button>
            </div>
          </div>
          <div className="admin-card-body">
            <div style={{ height: '320px' }}>
              {chartType === 'line' ? (
                <Line
                  data={{
                    labels: salesByMonth.map(item => item.month),
                    datasets: [{
                      label: 'Revenue (₹)',
                      data: salesByMonth.map(item => item.sales),
                      borderColor: '#0066cc',
                      backgroundColor: 'rgba(0, 102, 204, 0.05)',
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: '#fff',
                      pointBorderWidth: 2
                    }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              ) : (
                <Bar
                  data={{
                    labels: salesByMonth.map(item => item.month),
                    datasets: [{
                      label: 'Orders Count',
                      data: salesByMonth.map(item => item.orders),
                      backgroundColor: 'rgba(56, 189, 248, 0.8)',
                      borderRadius: 6
                    }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Sector Performance</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ height: '320px' }}>
              <Pie
                data={{
                  labels: salesByCategory.map(item => item.name),
                  datasets: [{
                    data: salesByCategory.map(item => item.value),
                    backgroundColor: ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operational Lists Row */}
      <div className="grid grid-2" style={{ gap: '2rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Transactions</h2>
            <Link to="/admin/orders" className="admin-link">Full Registry</Link>
          </div>
          <div className="admin-card-body" style={{ padding: '0' }}>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Customer</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentOrders.slice(0, 6).map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '600', color: '#0066cc' }}>#{order.id.slice(-6).toUpperCase()}</td>
                      <td>{order.userName}</td>
                      <td>{formatPrice(order.total)}</td>
                      <td>
                        <span className={`admin-badge badge-${getStatusColor(order.status) === 'primary' ? 'blue' : (getStatusColor(order.status) === 'success' ? 'green' : 'orange')}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Hottest Products</h2>
            <Link to="/admin/products" className="admin-link">Inventory Control</Link>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {analytics.topProducts.slice(0, 5).map((product, idx) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.25rem', borderBottom: idx === 4 ? 'none' : '1px solid #f1f5f9' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', background: '#f8fafc' }}>
                    <img
                      src={constructImageUrl(product.image)}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = createFallbackImage(); }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{product.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>{formatPrice(product.price)} • {product.totalSales} units sold</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: '#0066cc', fontSize: '0.9375rem' }}>⭐ {product.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
