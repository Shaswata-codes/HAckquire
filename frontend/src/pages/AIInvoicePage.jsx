import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Sparkles, Send, Plus, Trash2, Save, Download, ArrowLeft, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency, downloadInvoicePDF } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const EXAMPLES = [
  "Repaired Rahul's AC for ₹2500 and replaced the filter for ₹600. Payment due in 7 days.",
  "Taught Priya mathematics for 10 sessions at ₹500 each. Also charged ₹800 for study material.",
  "Tailored 3 blouses for Meena at ₹350 each. Payment due in 3 days.",
  "Installed 2 ceiling fans at Suresh's house for ₹400 each. Also repaired exhaust fan for ₹350.",
];

function ItemRow({ item, index, onChange, onDelete, isOnly }) {
  return (
    <div className="p-3 sm:p-2 rounded-xl bg-black/20 border border-white/[0.06] sm:border-0 sm:bg-transparent">
      {/* Desktop Grid */}
      <div className="hidden sm:grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 80px 110px 110px 36px' }}>
        <input
          className="input-dark text-sm"
          placeholder="Service or item description"
          value={item.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
        />
        <input
          className="input-dark text-sm text-center"
          type="number"
          min="1"
          placeholder="Qty"
          value={item.quantity}
          onChange={(e) => onChange(index, 'quantity', e.target.value)}
        />
        <input
          className="input-dark text-sm text-right"
          type="number"
          min="0"
          placeholder="Rate ₹"
          value={item.rate}
          onChange={(e) => onChange(index, 'rate', e.target.value)}
        />
        <div className="input-dark text-sm text-right text-indigo-400 font-semibold truncate">
          {formatCurrency((item.quantity || 0) * (item.rate || 0))}
        </div>
        <button
          onClick={() => onDelete(index)}
          disabled={isOnly}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          style={{ background: 'rgba(239,68,68,0.12)', color: isOnly ? '#4b5563' : '#ef4444' }}
          title="Delete item"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Mobile Stacked Card */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-400">Item #{index + 1}</span>
          <button
            onClick={() => onDelete(index)}
            disabled={isOnly}
            className="p-1 text-rose-400 disabled:text-slate-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
        <input
          className="input-dark text-sm"
          placeholder="Description (e.g. AC Servicing)"
          value={item.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
        />
        <div className="grid grid-cols-3 gap-2 items-center">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-0.5">Qty</label>
            <input
              className="input-dark text-sm text-center"
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => onChange(index, 'quantity', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-0.5">Rate (₹)</label>
            <input
              className="input-dark text-sm text-right"
              type="number"
              min="0"
              value={item.rate}
              onChange={(e) => onChange(index, 'rate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-0.5">Amount</label>
            <div className="input-dark text-sm text-right text-indigo-400 font-bold truncate">
              {formatCurrency((item.quantity || 0) * (item.rate || 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIInvoicePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientPhone: '', clientAddress: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
    taxRate: 0, discount: 0, dueDate: '', notes: '', status: 'sent',
  });

  const calcTotals = (items, taxRate, discount) => {
    const subtotal = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.rate) || 0), 0);
    const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
    const total = Math.max(0, subtotal + taxAmount - (parseFloat(discount) || 0));
    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calcTotals(form.items, form.taxRate, form.discount);

  const handleAIExtract = async () => {
    if (!text.trim()) return toast.error('Please enter a description of your work');
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/invoice', { text });
      const extracted = data.data;

      setForm(prev => ({
        ...prev,
        clientName: extracted.clientName || '',
        clientEmail: extracted.clientEmail || '',
        clientPhone: extracted.clientPhone || '',
        taxRate: extracted.taxRate || 0,
        dueDate: extracted.suggestedDueDate || '',
        notes: extracted.notes || '',
        items: extracted.items?.length > 0
          ? extracted.items.map(i => ({ description: i.description, quantity: i.quantity, rate: i.rate }))
          : [{ description: '', quantity: 1, rate: 0 }],
      }));

      setShowForm(true);
      toast.success('✨ AI extracted invoice data! Review and edit below.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI extraction failed. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index] = { ...updated[index], [field]: field === 'description' ? value : parseFloat(value) || 0 };
    setForm({ ...form, items: updated });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, rate: 0 }] });
  const deleteItem = (index) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    if (!form.clientName) return toast.error('Client name is required');
    if (!form.items.some(i => i.description && i.rate > 0)) return toast.error('Add at least one item with a rate');

    setSaveLoading(true);
    try {
      const { data } = await api.post('/invoices', { ...form, aiGenerated: true });
      toast.success(`Invoice ${data.invoiceNumber} saved!`);
      navigate(`/invoices/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDownloadPreview = async () => {
    const previewInvoice = {
      invoiceNumber: 'PREVIEW',
      clientName: form.clientName || 'Client Name',
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      clientAddress: form.clientAddress,
      items: form.items.map(i => ({ ...i, amount: i.quantity * i.rate })),
      subtotal, taxRate: form.taxRate, taxAmount, discount: form.discount,
      total, amountPaid: 0, amountDue: total,
      issueDate: new Date(), dueDate: form.dueDate ? new Date(form.dueDate) : null,
      notes: form.notes,
    };
    await downloadInvoicePDF(previewInvoice, user);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button onClick={() => navigate(-1)} className="btn-secondary !p-2 sm:!p-2.5 rounded-xl cursor-pointer">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 text-white">
            <Sparkles size={22} className="text-indigo-400 flex-shrink-0" />
            AI Invoice Generator
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Describe your work in plain words — AI does the rest</p>
        </div>
      </div>

      {/* AI Input */}
      <div className="ai-input-container mb-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            <Wand2 size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs sm:text-sm font-bold text-indigo-200 mb-1.5">
              Describe your work in natural language
            </label>
            <textarea
              id="ai-text-input"
              className="ai-textarea min-h-[90px] text-sm sm:text-base"
              placeholder="e.g. Repaired Rahul's AC for ₹2500 and replaced the filter for ₹600. Payment due in 7 days."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center pt-2">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer py-1"
          >
            {showExamples ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showExamples ? 'Hide examples' : 'Try sample prompts'}
          </button>
          <button
            id="ai-extract-btn"
            onClick={handleAIExtract}
            disabled={aiLoading || !text.trim()}
            className="btn-primary w-full sm:w-auto"
          >
            {aiLoading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Extracting Data...</>
            ) : (
              <><Sparkles size={16} />Extract with AI</>
            )}
          </button>
        </div>

        {/* Examples */}
        {showExamples && (
          <div className="mt-4 space-y-2 pt-4 border-t border-indigo-500/20">
            <p className="text-xs text-slate-400 mb-2 font-medium">Click any example to fill the prompt:</p>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setText(ex); setShowExamples(false); }}
                className="w-full text-left text-xs sm:text-sm p-2.5 sm:p-3 rounded-xl transition-all hover:bg-indigo-500/15 bg-white/[0.03] border border-white/[0.06] text-slate-300 hover:text-white cursor-pointer"
              >
                "{ex}"
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manual create toggle */}
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-secondary w-full justify-center mb-6 py-3 text-sm font-semibold"
        >
          <Plus size={16} />
          Or create invoice manually
        </button>
      )}

      {/* Invoice Form */}
      {showForm && (
        <div className="glass-card p-4 sm:p-6 md:p-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-6 pb-4 border-b border-white/[0.08]">
            <h2 className="font-extrabold text-lg sm:text-xl flex items-center gap-2 text-white">
              <Send size={18} className="text-indigo-400" />
              Invoice Details
            </h2>
            <span className="text-xs text-slate-400">Review & edit details before saving</span>
          </div>

          {/* Client Info */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Client Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Client Name *</label>
                <input className="input-dark" id="inv-client" placeholder="Client Name"
                  value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input className="input-dark" placeholder="client@email.com" type="email"
                  value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                <input className="input-dark" placeholder="+91-XXXXXXXXXX"
                  value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address</label>
                <input className="input-dark" placeholder="Client address"
                  value={form.clientAddress} onChange={(e) => setForm({ ...form, clientAddress: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items & Services</h3>
            <div className="hidden sm:grid gap-2 mb-2 px-2" style={{ gridTemplateColumns: '1fr 80px 110px 110px 36px' }}>
              {['Description', 'Qty', 'Rate (₹)', 'Amount', ''].map((h, i) => (
                <div key={i} className="text-[11px] text-slate-500 font-bold uppercase">{h}</div>
              ))}
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <ItemRow key={i} item={item} index={i} onChange={updateItem} onDelete={deleteItem} isOnly={form.items.length === 1} />
              ))}
            </div>
            <button type="button" onClick={addItem} className="btn-secondary mt-3 text-xs sm:text-sm py-2">
              <Plus size={15} /> Add Another Item
            </button>
          </div>

          {/* Totals & Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-white/[0.08]">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Invoice Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Tax Rate (%)</label>
                  <input className="input-dark" type="number" min="0" max="100" placeholder="0"
                    value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Discount (₹)</label>
                  <input className="input-dark" type="number" min="0" placeholder="0"
                    value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-300 mb-1">Due Date</label>
                  <input className="input-dark" type="date" value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-300 mb-1">Notes / Terms</label>
                  <textarea className="input-dark" rows={2} placeholder="Additional notes or payment instructions..."
                    value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="flex flex-col justify-between">
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/[0.06] border border-indigo-500/20 space-y-3">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
                </div>
                {form.taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tax ({form.taxRate}%)</span>
                    <span className="font-semibold text-white">{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {form.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Discount</span>
                    <span className="font-semibold text-emerald-400">-{formatCurrency(form.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-lg sm:text-xl pt-3 border-t border-indigo-500/25">
                  <span className="text-white">Total</span>
                  <span className="gradient-text">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  id="save-invoice-btn"
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="btn-primary w-full py-3 text-sm font-semibold"
                >
                  {saveLoading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                  ) : (
                    <><Save size={16} />Save Invoice</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPreview}
                  className="btn-secondary w-full py-3 text-sm font-semibold"
                >
                  <Download size={16} />
                  Preview PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
