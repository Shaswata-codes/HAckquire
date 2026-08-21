import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { Search, Plus, Filter, FileText, Sparkles, Eye } from 'lucide-react';

const STATUS_FILTERS = ['all', 'draft', 'sent', 'paid', 'partial', 'overdue'];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchInvoices = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/invoices', { params });
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, [search, statusFilter]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black">Invoices</h1>
          <p className="text-gray-400 text-sm">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/ai-invoice" className="btn-primary">
          <Sparkles size={16} />
          New AI Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-dark pl-9" placeholder="Search by client or invoice number..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${statusFilter === s
                ? 'bg-indigo-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              style={statusFilter !== s ? { border: '1px solid rgba(255,255,255,0.08)' } : {}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : invoices.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FileText size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No invoices found</h3>
          <p className="text-gray-500 mb-6">
            {search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first invoice with AI'}
          </p>
          <Link to="/ai-invoice" className="btn-primary">
            <Sparkles size={16} />
            Create with AI
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{inv.invoiceNumber}</span>
                        {inv.aiGenerated && (
                          <Sparkles size={12} className="text-indigo-400" title="AI Generated" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{inv.clientName}</div>
                      {inv.clientEmail && <div className="text-xs text-gray-500">{inv.clientEmail}</div>}
                    </td>
                    <td className="text-gray-400 text-sm">{formatDate(inv.issueDate)}</td>
                    <td className="text-sm">
                      {inv.dueDate ? (
                        <span className={inv.status === 'overdue' ? 'text-red-400' : 'text-gray-400'}>
                          {formatDate(inv.dueDate)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="font-bold">{formatCurrency(inv.total)}</td>
                    <td className="text-green-400">{formatCurrency(inv.amountPaid)}</td>
                    <td><span className={`badge ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                    <td>
                      <Link to={`/invoices/${inv._id}`} className="btn-secondary py-1.5 px-3 text-xs">
                        <Eye size={13} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
