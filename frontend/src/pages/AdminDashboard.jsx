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
  const salesByYear = analytics.salesByYear || [];
  const salesByCategory = analytics.salesByCategory || [];
  const topProducts = analytics.topProducts || [];

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

      {/* Data Visualization Row 1 */}
      <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Monthly Sales Performance</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ height: '320px' }}>
              <Bar
                data={{
                  labels: salesByMonth.map(item => item.month),
                  datasets: [{
                    label: 'Revenue (₹)',
                    data: salesByMonth.map(item => item.sales),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderRadius: 6
                  }]
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Yearly Progressive Sales</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ height: '320px' }}>
              <Bar
                data={{
                  labels: salesByYear.map(item => item.year),
                  datasets: [{
                    label: 'Revenue (₹)',
                    data: salesByYear.map(item => item.sales),
                    backgroundColor: '#10b981',
                    borderRadius: 6
                  }]
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Data Visualization Row 2 */}
      <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Category Sales Velocity</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ height: '320px' }}>
              <Bar
                data={{
                  labels: salesByCategory.map(item => item.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')),
                  datasets: [{
                    label: 'Total Revenue (₹)',
                    data: salesByCategory.map(item => item.sales),
                    backgroundColor: '#8b5cf6',
                    borderRadius: 6
                  }]
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Top Acquired Products (Volume)</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ height: '320px' }}>
              <Bar
                data={{
                  labels: topProducts.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name),
                  datasets: [{
                    label: 'Units Sold',
                    data: topProducts.map(item => item.totalSales),
                    backgroundColor: '#ec4899',
                    borderRadius: 6
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
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
            <h2>Category Sales Breakdown</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {analytics.salesByCategory.slice(0, 5).map((cat, idx) => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.25rem', borderBottom: idx === 4 ? 'none' : '1px solid #f1f5f9' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
                      {cat.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
                      {cat.orders} Orders processed
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>
                      {formatPrice(cat.sales)}
                    </div>
                    <div style={{ fontWeight: '600', color: '#10b981', fontSize: '0.8rem' }}>
                      {cat.percentage}% of total
                    </div>
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
