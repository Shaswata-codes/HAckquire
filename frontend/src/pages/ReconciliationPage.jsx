import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/helpers';
import { CreditCard, CheckCircle, XCircle, Link as LinkIcon, ArrowRight } from 'lucide-react';

export default function ReconciliationPage() {
  const [data, setData] = useState({ payments: [], unmatchedInvoices: [] });
  const [loading, setLoading] = useState(true);
  const [matchingId, setMatchingId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState('');

  const fetchData = async () => {
    try {
      const { data: res } = await api.get('/payments/reconciliation');
      setData(res);
    } catch (err) {
      toast.error('Failed to load reconciliation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMatch = async (paymentId) => {
    if (!selectedInvoice) return toast.error('Please select an invoice to match');
    try {
      await api.put(`/payments/${paymentId}/match`, { invoiceId: selectedInvoice });
      toast.success('Payment matched successfully! ✅');
      setMatchingId(null);
      setSelectedInvoice('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to match payment');
    }
  };

  const handleUnmatch = async (paymentId) => {
    try {
      await api.put(`/payments/${paymentId}/unmatch`);
      toast.success('Payment unmatched');
      fetchData();
    } catch {
      toast.error('Failed to unmatch payment');
    }
  };

  const matched = data.payments.filter(p => p.status === 'matched');
  const unmatched = data.payments.filter(p => p.status === 'unmatched');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <CreditCard size={22} className="text-indigo-400" />
          UPI Reconciliation
        </h1>
        <p className="text-gray-400 text-sm mt-1">Match incoming UPI payments to your invoices</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Transactions</p>
          <p className="text-2xl font-black text-white">{data.payments.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Matched</p>
          <p className="text-2xl font-black text-green-400">{matched.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Unmatched</p>
          <p className="text-2xl font-black text-red-400">{unmatched.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : (
        <>
          {/* Unmatched Payments */}
          {unmatched.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <XCircle size={18} className="text-red-400" />
                Unmatched Transactions
                <span className="badge badge-unmatched ml-2">{unmatched.length}</span>
              </h2>
              <div className="space-y-3">
                {unmatched.map((payment) => (
                  <div key={payment._id} className="glass-card p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                            <XCircle size={16} className="text-red-400" />
                          </div>
                          <div>
                            <div className="font-bold">{payment.senderName}</div>
                            <div className="text-xs text-gray-500">{payment.senderUPI} • {formatDate(payment.date)}</div>
                          </div>
                          <div className="ml-auto font-black text-lg">{formatCurrency(payment.amount)}</div>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{payment.transactionId}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        {matchingId === payment._id ? (
                          <>
                            <select
                              className="input-dark text-sm"
                              value={selectedInvoice}
                              onChange={(e) => setSelectedInvoice(e.target.value)}
                              style={{ minWidth: '200px' }}
                            >
                              <option value="">Select invoice...</option>
                              {data.unmatchedInvoices.map(inv => (
                                <option key={inv._id} value={inv._id}>
                                  {inv.invoiceNumber} — {inv.clientName} ({formatCurrency(inv.amountDue)} due)
                                </option>
                              ))}
                            </select>
                            <button onClick={() => handleMatch(payment._id)} className="btn-primary py-2 px-4 text-sm">
                              <LinkIcon size={14} /> Match
                            </button>
                            <button onClick={() => { setMatchingId(null); setSelectedInvoice(''); }}
                              className="btn-secondary py-2 px-3 text-sm">Cancel</button>
                          </>
                        ) : (
                          <button
                            id={`match-btn-${payment._id}`}
                            onClick={() => setMatchingId(payment._id)}
                            className="btn-primary py-2 px-4 text-sm"
                          >
                            <ArrowRight size={14} />
                            Match to Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Payments */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400" />
              Matched Transactions
              <span className="badge badge-matched ml-2">{matched.length}</span>
            </h2>
            {matched.length === 0 ? (
              <div className="glass-card p-10 text-center text-gray-500">No matched transactions yet</div>
            ) : (
              <div className="glass-card overflow-hidden">
                <table className="table-dark">
                  <thead>
                    <tr>
                      <th>Sender</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Matched Invoice</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {matched.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          <div className="font-semibold">{payment.senderName}</div>
                          <div className="text-xs text-gray-500">{payment.senderUPI}</div>
                        </td>
                        <td className="font-bold text-green-400">{formatCurrency(payment.amount)}</td>
                        <td className="text-sm text-gray-400">{formatDate(payment.date)}</td>
                        <td>
                          {payment.invoiceId ? (
                            <div>
                              <div className="font-mono text-sm font-semibold">{payment.invoiceId.invoiceNumber}</div>
                              <div className="text-xs text-gray-500">{payment.invoiceId.clientName}</div>
                            </div>
                          ) : '—'}
                        </td>
                        <td><span className="badge badge-matched">Matched</span></td>
                        <td>
                          <button onClick={() => handleUnmatch(payment._id)}
                            className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded">
                            Unmatch
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
