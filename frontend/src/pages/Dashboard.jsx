import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { Sparkles, TrendingUp, Clock, AlertTriangle, FileText, ArrowRight, Plus } from 'lucide-react';

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-black" style={{ color }}>{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices/stats').then(({ data }) => {
      setStats(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}! 👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{user?.businessName || 'Freelance Workspace'}</p>
        </div>
        <Link to="/ai-invoice" id="dashboard-create-btn" className="btn-primary py-2.5 px-4 text-sm font-semibold">
          <Sparkles size={16} />
          Create Invoice with AI
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Invoices"
          value={stats?.totalInvoices || 0}
          icon={FileText}
          color="#6366f1"
          sub="All time"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue)}
          icon={TrendingUp}
          color="#10b981"
          sub="Paid invoices"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(stats?.pendingAmount)}
          icon={Clock}
          color="#f59e0b"
          sub="Awaiting payment"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueCount || 0}
          icon={AlertTriangle}
          color="#ef4444"
          sub={stats?.overdueCount > 0 ? `${formatCurrency(stats?.overdueAmount)} at risk` : 'All clear! 🎉'}
        />
      </div>

      {/* Quick actions + recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Plus size={18} className="text-indigo-400" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/ai-invoice" className="flex items-center justify-between p-3 rounded-xl hover:opacity-90 transition-opacity group"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}>
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-indigo-400" />
                <div>
                  <div className="font-semibold text-sm">AI Invoice Generator</div>
                  <div className="text-xs text-gray-500">Describe your work in words</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
            </Link>

            <Link to="/invoices" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-400" />
                <div>
                  <div className="font-semibold text-sm">View All Invoices</div>
                  <div className="text-xs text-gray-500">{stats?.totalInvoices} invoices total</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
            </Link>

            <Link to="/reminders" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className={stats?.overdueCount > 0 ? 'text-red-400' : 'text-gray-400'} />
                <div>
                  <div className="font-semibold text-sm">Due Reminders</div>
                  <div className="text-xs text-gray-500">{stats?.overdueCount} overdue invoices</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Recent Invoices</h2>
            <Link to="/invoices" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {stats?.recentInvoices?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentInvoices.map((inv) => (
                <Link key={inv._id} to={`/invoices/${inv._id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)' }}>
                      <FileText size={14} className="text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{inv.clientName}</div>
                      <div className="text-xs text-gray-500">{inv.invoiceNumber} • {formatDate(inv.issueDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`badge ${getStatusColor(inv.status)}`}>{inv.status}</span>
                    <span className="font-bold text-sm">{formatCurrency(inv.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No invoices yet</p>
              <Link to="/ai-invoice" className="btn-primary text-sm py-2 px-4">
                <Sparkles size={14} />
                Create your first invoice
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
