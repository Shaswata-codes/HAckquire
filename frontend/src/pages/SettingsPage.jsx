import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Settings, User, Building, Phone, MapPin, CreditCard, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '', businessName: '', phone: '', address: '', gstNumber: '', currency: 'INR', password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        businessName: user.businessName || '',
        phone: user.phone || '',
        address: user.address || '',
        gstNumber: user.gstNumber || '',
        currency: user.currency || 'INR',
        password: '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const { data } = await api.put('/auth/profile', payload);
      updateUser(data);
      toast.success('Profile updated successfully! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('This will reset demo data for your account. Continue?')) return;
    try {
      await api.post('/seed');
      toast.success('Demo data seeded! Refresh the page.');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seed failed - only works in development mode');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Settings size={22} className="text-indigo-400" />
          Settings & Profile
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and business information</p>
      </div>

      <div className="glass-card p-8">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                <User size={13} /> Full Name
              </label>
              <input className="input-dark" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                <Building size={13} /> Business Name
              </label>
              <input className="input-dark" value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                <Phone size={13} /> Phone
              </label>
              <input className="input-dark" placeholder="+91-XXXXXXXXXX" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                <CreditCard size={13} /> GST Number
              </label>
              <input className="input-dark" placeholder="e.g. 09AABCU9603R1ZP" value={form.gstNumber}
                onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
              <MapPin size={13} /> Business Address
            </label>
            <textarea className="input-dark" rows={2} placeholder="Your business address..."
              value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-semibold text-sm mb-3 text-gray-300">Change Password</h3>
            <input className="input-dark" type="password" placeholder="Leave blank to keep current password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={15} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Dev: Seed data */}
        <div className="mt-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-1 text-gray-400">Demo Data</h3>
          <p className="text-xs text-gray-600 mb-3">Reset demo data for testing (development only)</p>
          <button onClick={handleSeedData}
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
            Seed Demo Data
          </button>
        </div>
      </div>
    </div>
  );
}
