import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Sparkles, CreditCard, Bell,
  Users, Settings, LogOut, Zap, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ai-invoice', icon: Sparkles, label: 'AI Invoice', badge: 'AI' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/reconciliation', icon: CreditCard, label: 'UPI Reconciliation' },
  { to: '/reminders', icon: Bell, label: 'Due Reminders' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentItem = navItems.find(item => item.to === location.pathname) || { label: 'Hackquire' };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#101124] border-r border-white/10">
      {/* Brand Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            <Zap size={20} className="text-white fill-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight gradient-text">Hackquire</span>
            <div className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">AI Invoicing</div>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="mx-4 my-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-inner flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</div>
            <div className="text-xs text-slate-400 truncate">{user?.businessName || user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/30">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#101124]/95 backdrop-blur-md border-b border-white/10 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 -ml-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-600">
              <Zap size={15} className="text-white fill-white" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight">{currentItem.label}</span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-indigo-600 border border-white/20">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block fixed top-0 bottom-0 left-0 w-[260px] z-30">
        <SidebarContent />
      </aside>
    </>
  );
}
