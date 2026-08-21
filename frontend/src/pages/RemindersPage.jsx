import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, getDaysUntilDue, getWhatsAppLink, getSMSLink } from '../utils/helpers';
import { Bell, AlertTriangle, Clock, MessageSquare, Phone, Send, ExternalLink } from 'lucide-react';

function ReminderCard({ invoice, type }) {
  const days = getDaysUntilDue(invoice.dueDate);
  const isOverdue = type === 'overdue';

  const sendReminder = (method) => {
    if (method === 'whatsapp') {
      const url = getWhatsAppLink(invoice.clientPhone, invoice.invoiceNumber, invoice.amountDue, invoice.clientName);
      window.open(url, '_blank');
      toast.success(`WhatsApp reminder opened for ${invoice.clientName} ✅`);
    } else if (method === 'sms') {
      const url = getSMSLink(invoice.clientPhone, invoice.invoiceNumber, invoice.amountDue, invoice.clientName);
      window.open(url, '_blank');
      toast.success(`SMS reminder opened for ${invoice.clientName} ✅`);
    }
  };

  return (
    <div className="glass-card p-5 hover:scale-[1.01] transition-transform">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isOverdue
              ? 'bg-red-500/15 border border-red-500/30'
              : 'bg-amber-500/15 border border-amber-500/30'
          }`}>
            {isOverdue
              ? <AlertTriangle size={18} className="text-red-400" />
              : <Clock size={18} className="text-amber-400" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold">{invoice.clientName}</h3>
              <span className="font-mono text-xs text-gray-500">{invoice.invoiceNumber}</span>
            </div>
            <div className="text-sm text-gray-400 mb-1">
              Due: {formatDate(invoice.dueDate)}
              {' '}
              {isOverdue ? (
                <span className="text-red-400 font-semibold">• {Math.abs(days)} days overdue</span>
              ) : (
                <span className="text-amber-400 font-semibold">• {days} day{days !== 1 ? 's' : ''} remaining</span>
              )}
            </div>
            {invoice.clientPhone && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Phone size={10} />
                {invoice.clientPhone}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-xl font-black" style={{ color: isOverdue ? '#ef4444' : '#f59e0b' }}>
            {formatCurrency(invoice.amountDue)}
          </div>
          <div className="flex gap-2">
            <button
              id={`whatsapp-${invoice._id}`}
              onClick={() => sendReminder('whatsapp')}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ background: 'rgba(37,211,102,0.15)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)' }}
            >
              <MessageSquare size={13} />
              WhatsApp
              <ExternalLink size={10} />
            </button>
            <button
              id={`sms-${invoice._id}`}
              onClick={() => sendReminder('sms')}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <Phone size={13} />
              SMS
              <ExternalLink size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RemindersPage() {
  const [data, setData] = useState({ overdue: [], dueSoon: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices/reminders')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalOverdueAmount = data.overdue.reduce((s, inv) => s + inv.amountDue, 0);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Bell size={22} className="text-indigo-400" />
          Due Reminders
        </h1>
        <p className="text-gray-400 text-sm mt-1">Send WhatsApp or SMS reminders for overdue and upcoming invoices</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : (
        <>
          {/* Summary banner */}
          {data.overdue.length > 0 && (
            <div className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-red-400">{data.overdue.length} overdue invoice{data.overdue.length !== 1 ? 's' : ''}</span>
                <span className="text-gray-400 ml-2">— Total at risk: <strong className="text-red-400">{formatCurrency(totalOverdueAmount)}</strong></span>
              </div>
            </div>
          )}

          {/* Overdue */}
          {data.overdue.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" />
                Overdue Invoices
              </h2>
              <div className="space-y-3">
                {data.overdue.map(inv => <ReminderCard key={inv._id} invoice={inv} type="overdue" />)}
              </div>
            </div>
          )}

          {/* Due Soon */}
          {data.dueSoon.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock size={18} className="text-amber-400" />
                Due Within 7 Days
              </h2>
              <div className="space-y-3">
                {data.dueSoon.map(inv => <ReminderCard key={inv._id} invoice={inv} type="due_soon" />)}
              </div>
            </div>
          )}

          {data.overdue.length === 0 && data.dueSoon.length === 0 && (
            <div className="glass-card p-16 text-center">
              <Bell size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">All caught up! 🎉</h3>
              <p className="text-gray-500">No overdue or upcoming invoices. Great job!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
