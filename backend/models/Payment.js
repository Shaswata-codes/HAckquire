const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  amount: { type: Number, required: true },
  transactionId: { type: String, default: '' },
  senderName: { type: String, default: '' },
  senderUPI: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['upi', 'cash', 'bank_transfer', 'cheque', 'other'], default: 'upi' },
  status: { type: String, enum: ['matched', 'unmatched', 'partial'], default: 'unmatched' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
