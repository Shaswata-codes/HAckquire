const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  invoiceNumber: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, default: '' },
  clientPhone: { type: String, default: '' },
  clientAddress: { type: String, default: '' },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true, default: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true, default: 0 },
  amountPaid: { type: Number, default: 0 },
  amountDue: { type: Number, default: 0 },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'],
    default: 'draft'
  },
  notes: { type: String, default: '' },
  terms: { type: String, default: 'Payment due within the specified period.' },
  aiGenerated: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-update status based on dates and payment
invoiceSchema.pre('save', function() {
  this.amountDue = this.total - (this.amountPaid || 0);
  if (this.amountPaid >= this.total && this.total > 0) {
    this.status = 'paid';
  } else if (this.amountPaid > 0 && this.amountPaid < this.total) {
    this.status = 'partial';
  } else if (this.dueDate && new Date() > this.dueDate && (!this.amountPaid || this.amountPaid === 0)) {
    this.status = 'overdue';
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
