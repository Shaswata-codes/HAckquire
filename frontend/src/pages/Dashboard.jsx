import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Sparkles, TrendingUp, Clock, AlertTriangle, FileText, ArrowRight, Plus } from 'lucide-react';

/* ---------------------------------------------------------
   Design tokens — everything below is derived from these.
--------------------------------------------------------- */
const T = {
  bg: '#0A0E17',
  surface: 'rgba(255,255,255,0.035)',
  surfaceHover: 'rgba(255,255,255,0.065)',
  border: 'rgba(255,255,255,0.08)',
  borderSoft: 'rgba(255,255,255,0.05)',
  text: '#F1F5F9',
  textDim: '#94A3B8',
  textFaint: '#5B6779',
  indigo: '#6366F1',
  cyan: '#22D3EE',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
};

const gradientText = {
  backgroundImage: `linear-gradient(120deg, ${T.indigo}, ${T.cyan})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
};

const glassCard = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 20,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background: `linear-gradient(120deg, ${T.indigo}, ${T.cyan})`,
  color: '#fff',
  borderRadius: 14,
  boxShadow: `0 6px 20px -4px ${T.indigo}66`,
  border: '1px solid rgba(255,255,255,0.12)',
  transition: 'transform 180ms ease, box-shadow 180ms ease, filter 180ms ease',
};

function statusPalette(status) {
  const map = {
    paid: { bg: 'rgba(16,185,129,0.12)', fg: T.emerald, bd: 'rgba(16,185,129,0.35)' },
    pending: { bg: 'rgba(245,158,11,0.12)', fg: T.amber, bd: 'rgba(245,158,11,0.35)' },
    overdue: { bg: 'rgba(244,63,94,0.12)', fg: T.rose, bd: 'rgba(244,63,94,0.35)' },
    draft: { bg: 'rgba(148,163,184,0.12)', fg: T.textDim, bd: 'rgba(148,163,184,0.3)' },
  };
  return map[status?.toLowerCase()] || map.draft;
}

function StatCard({ title, value, icon: Icon, color, sub, delay }) {
  return (
    <div
      className="dash-stat-card"
      style={{
        ...glassCard,
        padding: 20,
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textFaint, marginBottom: 6, fontWeight: 600 }}>
            {title}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: T.textDim, marginTop: 6 }}>{sub}</p>}
        </div>
        <div
          style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${color}1F`, border: `1px solid ${color}40`,
          }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div style={{ height: 3, borderRadius: 999, background: `${color}25`, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '55%', borderRadius: 999, background: color, opacity: 0.8 }} />
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  return (
    <div style={{ background: T.bg, minHeight: '100%' }} className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Scoped styles: hover states, focus rings, animations — kept in this file */}
      <style>{`
        .dash-stat-card, .dash-quick-link, .dash-recent-row, .dash-view-all, .dash-btn-primary {
          animation: dashFadeUp 420ms cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes dashFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dash-stat-card { transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease; }
        .dash-stat-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.16); box-shadow: 0 14px 40px rgba(0,0,0,0.35); }

        .dash-quick-link, .dash-recent-row { transition: background 160ms ease, border-color 160ms ease, transform 160ms ease; }
        .dash-quick-link:hover, .dash-recent-row:hover { background: ${T.surfaceHover}; border-color: rgba(255,255,255,0.14); transform: translateX(2px); }
        .dash-quick-link:hover .dash-arrow, .dash-recent-row:hover .dash-arrow { color: ${T.cyan} !important; transform: translateX(2px); }
        .dash-arrow { transition: transform 160ms ease, color 160ms ease; }

        .dash-btn-primary:hover { transform: translateY(-1px); filter: brightness(1.08); box-shadow: 0 10px 28px -4px ${T.indigo}80; }
        .dash-btn-primary:active { transform: translateY(0); }

        .dash-view-all { transition: color 160ms ease, gap 160ms ease; }
        .dash-view-all:hover { color: ${T.cyan}; }

        .dash-skel { position: relative; overflow: hidden; background: ${T.surface}; border: 1px solid ${T.borderSoft}; }
        .dash-skel::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          animation: dashShimmer 1.4s ease-in-out infinite;
        }
        @keyframes dashShimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

        a:focus-visible, button:focus-visible {
          outline: 2px solid ${T.cyan};
          outline-offset: 2px;
          border-radius: 10px;
        }
      `}</style>

      {loading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="dash-skel h-28" style={{ borderRadius: 20 }} />
            ))}
          </div>
          <div className="dash-skel h-64" style={{ borderRadius: 20 }} />
        </>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>
                Good {greeting}, <span style={gradientText}>{user?.name?.split(' ')[0]}! 👋</span>
              </h1>
              <p style={{ fontSize: 13, color: T.textDim, marginTop: 2 }}>
                {user?.businessName || 'Freelance Workspace'}
              </p>
            </div>
            <Link
              to="/ai-invoice"
              id="dashboard-create-btn"
              className="dash-btn-primary"
              style={{ ...btnPrimary, padding: '10px 18px', fontSize: 14, fontWeight: 600 }}
            >
              <Sparkles size={16} />
              Create Invoice with AI
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Invoices" value={stats?.totalInvoices || 0} icon={FileText} color={T.indigo} sub="All time" delay={0} />
            <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue)} icon={TrendingUp} color={T.emerald} sub="Paid invoices" delay={60} />
            <StatCard title="Pending Amount" value={formatCurrency(stats?.pendingAmount)} icon={Clock} color={T.amber} sub="Awaiting payment" delay={120} />
            <StatCard
              title="Overdue"
              value={stats?.overdueCount || 0}
              icon={AlertTriangle}
              color={T.rose}
              sub={stats?.overdueCount > 0 ? `${formatCurrency(stats?.overdueAmount)} at risk` : 'All clear! 🎉'}
              delay={180}
            />
          </div>

          {/* Quick actions + recent */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div style={{ ...glassCard, padding: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={18} style={{ color: T.indigo }} />
                Quick Actions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  to="/ai-invoice"
                  className="dash-quick-link"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 12, borderRadius: 14,
                    background: `linear-gradient(120deg, ${T.indigo}22, ${T.cyan}14)`,
                    border: `1px solid ${T.indigo}40`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Sparkles size={18} style={{ color: T.indigo }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>AI Invoice Generator</div>
                      <div style={{ fontSize: 12, color: T.textDim }}>Describe your work in words</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="dash-arrow" style={{ color: T.textFaint }} />
                </Link>

                <Link
                  to="/invoices"
                  className="dash-quick-link"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 14, border: `1px solid ${T.borderSoft}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={18} style={{ color: T.textDim }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>View All Invoices</div>
                      <div style={{ fontSize: 12, color: T.textDim }}>{stats?.totalInvoices} invoices total</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="dash-arrow" style={{ color: T.textFaint }} />
                </Link>

                <Link
                  to="/reminders"
                  className="dash-quick-link"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 14, border: `1px solid ${T.borderSoft}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertTriangle size={18} style={{ color: stats?.overdueCount > 0 ? T.rose : T.textDim }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>Due Reminders</div>
                      <div style={{ fontSize: 12, color: T.textDim }}>{stats?.overdueCount} overdue invoices</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="dash-arrow" style={{ color: T.textFaint }} />
                </Link>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="lg:col-span-2" style={{ ...glassCard, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text, margin: 0 }}>Recent Invoices</h2>
                <Link
                  to="/invoices"
                  className="dash-view-all"
                  style={{ fontSize: 13, color: T.indigo, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              {stats?.recentInvoices?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.recentInvoices.map((inv, i) => {
                    const pal = statusPalette(inv.status);
                    return (
                      <Link
                        key={inv._id}
                        to={`/invoices/${inv._id}`}
                        className="dash-recent-row"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: 12, borderRadius: 14, border: `1px solid ${T.borderSoft}`,
                          animationDelay: `${i * 40}ms`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div
                            style={{
                              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: `${T.indigo}22`,
                            }}
                          >
                            <FileText size={14} style={{ color: T.indigo }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {inv.clientName}
                            </div>
                            <div style={{ fontSize: 12, color: T.textFaint }}>
                              {inv.invoiceNumber} • {formatDate(inv.issueDate)}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                              padding: '4px 10px', borderRadius: 999,
                              background: pal.bg, color: pal.fg, border: `1px solid ${pal.bd}`,
                            }}
                          >
                            {inv.status}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{formatCurrency(inv.total)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <FileText size={40} style={{ color: T.textFaint, margin: '0 auto 12px' }} />
                  <p style={{ color: T.textDim, marginBottom: 16 }}>No invoices yet</p>
                  <Link to="/ai-invoice" className="dash-btn-primary" style={{ ...btnPrimary, padding: '9px 16px', fontSize: 13, fontWeight: 600 }}>
                    <Sparkles size={14} />
                    Create your first invoice
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}