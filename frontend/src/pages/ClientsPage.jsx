import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, Trash2, Mail, Phone, Building } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', company: '' });
  const [saving, setSaving] = useState(false);

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/clients');
      setClients(data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Client name is required');
    setSaving(true);
    try {
      await api.post('/clients', form);
      toast.success('Client added!');
      setForm({ name: '', email: '', phone: '', address: '', company: '' });
      setShowModal(false);
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add client');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete client ${name}?`)) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client removed');
      fetchClients();
    } catch { toast.error('Failed to delete client'); }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Users size={22} className="text-indigo-400" />
            Clients
          </h1>
          <p className="text-gray-400 text-sm mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Add Client
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Users size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No clients yet</h3>
          <p className="text-gray-500 mb-6">Add your first client to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Add Client
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div key={client._id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                  {client.name[0].toUpperCase()}
                </div>
                <button onClick={() => handleDelete(client._id, client.name)}
                  className="text-gray-600 hover:text-red-400 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-bold mb-0.5">{client.name}</h3>
              {client.company && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <Building size={10} />{client.company}
                </div>
              )}
              <div className="space-y-1 mt-2">
                {client.email && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Mail size={11} />{client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Phone size={11} />{client.phone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">Add New Client</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input className="input-dark" placeholder="Client name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Company</label>
                <input className="input-dark" placeholder="Company name" value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input className="input-dark" type="email" placeholder="email@example.com" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <input className="input-dark" placeholder="+91-XXXXXXXXXX" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Address</label>
                <input className="input-dark" placeholder="Address" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Client'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
