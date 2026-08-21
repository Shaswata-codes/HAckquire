const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// @desc    Get all payments (UPI transactions)
// @route   GET /api/payments
const getPayments = async (req, res) => {
  const payments = await Payment.find({ userId: req.user._id })
    .populate('invoiceId', 'invoiceNumber clientName total')
    .sort({ date: -1 });
  res.json(payments);
};

// @desc    Match payment to invoice
// @route   PUT /api/payments/:id/match
const matchPayment = async (req, res) => {
  const { invoiceId } = req.body;

  const payment = await Payment.findOne({ _id: req.params.id, userId: req.user._id });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  const invoice = await Invoice.findOne({ _id: invoiceId, userId: req.user._id });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  // Update payment
  payment.invoiceId = invoiceId;
  payment.status = 'matched';
  await payment.save();

  // Update invoice amountPaid
  invoice.amountPaid = Math.min(invoice.amountPaid + payment.amount, invoice.total);
  await invoice.save();

  const populated = await payment.populate('invoiceId', 'invoiceNumber clientName total');
  res.json(populated);
};

// @desc    Unmatch payment from invoice
// @route   PUT /api/payments/:id/unmatch
const unmatchPayment = async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, userId: req.user._id });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  if (payment.invoiceId) {
    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      invoice.amountPaid = Math.max(0, invoice.amountPaid - payment.amount);
      await invoice.save();
    }
  }

  payment.invoiceId = null;
  payment.status = 'unmatched';
  await payment.save();

  res.json(payment);
};

// @desc    Get UPI reconciliation data
// @route   GET /api/payments/reconciliation
const getReconciliation = async (req, res) => {
  const [payments, invoices] = await Promise.all([
    Payment.find({ userId: req.user._id })
      .populate('invoiceId', 'invoiceNumber clientName total')
      .sort({ date: -1 }),
    Invoice.find({ userId: req.user._id, status: { $in: ['sent', 'partial', 'overdue'] } })
      .select('invoiceNumber clientName total amountPaid amountDue'),
  ]);

  res.json({ payments, unmatchedInvoices: invoices });
};

module.exports = { getPayments, matchPayment, unmatchPayment, getReconciliation };
