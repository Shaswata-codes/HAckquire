import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, getStatusColor, downloadInvoicePDF } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Download, Trash2, Edit, Check, Sparkles, Send } from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then(({ data }) => setInvoice(data))
      .catch(() => { toast.error('Invoice not found'); navigate('/invoices'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    try {
      const { data } = await api.put(`/invoices/${id}`, { amountPaid: invoice.total, status: 'paid' });
      setInvoice(data);
      toast.success('Invoice marked as paid! ✅');
    } catch {
      toast.error('Failed to update invoice');
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`)) return;
    try {
      await api.delete(`/invoices/${id}`);
      toast.success('Invoice deleted');
      navigate('/invoices');
    } catch {
      toast.error('Failed to delete invoice');
    }
  };

  const handleDownload = () => downloadInvoicePDF(invoice, user);

  if (loading) return (
    <div className="p-8">
      <div className="skeleton h-8 w-48 rounded mb-6" />
      <div className="skeleton h-96 rounded-2xl" />
    </div>
  );

  if (!invoice) return null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="btn-secondary py-2 px-3">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">{invoice.invoiceNumber}</h1>
              {invoice.aiGenerated && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <Sparkles size={10} /> AI
                </span>
              )}
            </div>
            <span className={`badge ${getStatusColor(invoice.status)} mt-1`}>{invoice.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {invoice.status !== 'paid' && (
            <button onClick={handleMarkPaid} disabled={markingPaid} className="btn-primary py-2 px-4 text-sm">
              <Check size={14} />
              {markingPaid ? 'Saving...' : 'Mark Paid'}
            </button>
          )}
          <button onClick={handleDownload} id="download-pdf-btn" className="btn-secondary py-2 px-4 text-sm">
            <Download size={14} /> Download PDF
          </button>
          <button onClick={handleDelete} className="py-2 px-3 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="invoice-preview shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                <Send size={14} className="text-white" />
              </div>
              <h2 className="text-2xl font-black" style={{ color: '#1a1a2e' }}>{user?.businessName}</h2>
            </div>
            {user?.address && <p className="text-sm" style={{ color: '#64748b' }}>{user.address}</p>}
            {user?.phone && <p className="text-sm" style={{ color: '#64748b' }}>{user.phone}</p>}
            {user?.gstNumber && <p className="text-sm" style={{ color: '#64748b' }}>GST: {user.gstNumber}</p>}
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>Invoice</div>
            <div className="text-3xl font-black" style={{ color: '#6366f1' }}>{invoice.invoiceNumber}</div>
            <div className="text-sm mt-2" style={{ color: '#64748b' }}>
              <div>Issued: {formatDate(invoice.issueDate)}</div>
              {invoice.dueDate && <div>Due: {formatDate(invoice.dueDate)}</div>}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8 p-4 rounded-xl" style={{ background: '#f8fafc' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>Bill To</div>
          <div className="text-xl font-bold" style={{ color: '#1a1a2e' }}>{invoice.clientName}</div>
          {invoice.clientEmail && <div className="text-sm" style={{ color: '#64748b' }}>{invoice.clientEmail}</div>}
          {invoice.clientPhone && <div className="text-sm" style={{ color: '#64748b' }}>{invoice.clientPhone}</div>}
          {invoice.clientAddress && <div className="text-sm" style={{ color: '#64748b' }}>{invoice.clientAddress}</div>}
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide rounded-l-lg" style={{ color: '#64748b' }}>Description</th>
              <th className="text-center p-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#64748b' }}>Qty</th>
              <th className="text-right p-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#64748b' }}>Rate</th>
              <th className="text-right p-3 text-xs font-bold uppercase tracking-wide rounded-r-lg" style={{ color: '#64748b' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="p-3" style={{ color: '#1a1a2e' }}>{item.description}</td>
                <td className="p-3 text-center text-sm" style={{ color: '#64748b' }}>{item.quantity}</td>
                <td className="p-3 text-right text-sm" style={{ color: '#64748b' }}>{formatCurrency(item.rate)}</td>
                <td className="p-3 text-right font-semibold" style={{ color: '#1a1a2e' }}>{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm" style={{ color: '#64748b' }}>
              <span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-sm" style={{ color: '#64748b' }}>
                <span>Tax ({invoice.taxRate}%)</span><span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm" style={{ color: '#64748b' }}>
                <span>Discount</span><span style={{ color: '#10b981' }}>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-xl pt-2" style={{ borderTop: '2px solid #6366f1', color: '#6366f1' }}>
              <span>Total</span><span>{formatCurrency(invoice.total)}</span>
            </div>
            {invoice.amountPaid > 0 && (
              <>
                <div className="flex justify-between text-sm" style={{ color: '#10b981' }}>
                  <span>Amount Paid</span><span>{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold" style={{ color: invoice.amountDue > 0 ? '#ef4444' : '#10b981' }}>
                  <span>Amount Due</span><span>{formatCurrency(invoice.amountDue)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 p-4 rounded-xl" style={{ background: '#f8fafc' }}>
            <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>Notes</div>
            <p className="text-sm" style={{ color: '#64748b' }}>{invoice.notes}</p>
          </div>
        )}

        <div className="mt-8 pt-6 text-center text-xs" style={{ borderTop: '1px solid #f1f5f9', color: '#94a3b8' }}>
          Generated by Hackquire — AI-Powered Invoicing for Independent Workers
        </div>
      </div>
    </div>
  );
}
