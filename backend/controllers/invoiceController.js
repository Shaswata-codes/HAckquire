const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// Generate invoice number
const generateInvoiceNumber = async (userId) => {
  const count = await Invoice.countDocuments({ userId });
  return `INV-${String(count + 1).padStart(3, '0')}`;
};

// Calculate totals (server-side always)
const calculateTotals = (items, taxRate = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const amount = (parseFloat(item.quantity) || 1) * (parseFloat(item.rate) || 0);
    return sum + amount;
  }, 0);
  const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
  const total = subtotal + taxAmount - (parseFloat(discount) || 0);
  return { subtotal, taxAmount, total: Math.max(0, total) };
};

// @desc    Get all invoices
// @route   GET /api/invoices
const getInvoices = async (req, res) => {
  const { status, search } = req.query;
  let query = { userId: req.user._id };

  if (status && status !== 'all') query.status = status;
  if (search) {
    query.$or = [
      { clientName: { $regex: search, $options: 'i' } },
      { invoiceNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const invoices = await Invoice.find(query).sort({ createdAt: -1 });
  res.json(invoices);
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
const getInvoice = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json(invoice);
};

// @desc    Create invoice
// @route   POST /api/invoices
const createInvoice = async (req, res) => {
  const { clientName, clientEmail, clientPhone, clientAddress, items, taxRate, discount, dueDate, notes, terms, status, aiGenerated } = req.body;

  if (!clientName || !items || items.length === 0) {
    return res.status(400).json({ message: 'Client name and items are required' });
  }

  const invoiceNumber = await generateInvoiceNumber(req.user._id);
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate, discount);

  // Enrich items with amount
  const enrichedItems = items.map(item => ({
    ...item,
    quantity: parseFloat(item.quantity) || 1,
    rate: parseFloat(item.rate) || 0,
    amount: (parseFloat(item.quantity) || 1) * (parseFloat(item.rate) || 0),
  }));

  const invoice = await Invoice.create({
    userId: req.user._id,
    invoiceNumber,
    clientName,
    clientEmail: clientEmail || '',
    clientPhone: clientPhone || '',
    clientAddress: clientAddress || '',
    items: enrichedItems,
    subtotal,
    taxRate: parseFloat(taxRate) || 0,
    taxAmount,
    discount: parseFloat(discount) || 0,
    total,
    amountPaid: 0,
    amountDue: total,
    issueDate: new Date(),
    dueDate: dueDate ? new Date(dueDate) : null,
    status: status || 'sent',
    notes: notes || '',
    terms: terms || 'Payment due within the specified period.',
    aiGenerated: aiGenerated || false,
  });

  res.status(201).json(invoice);
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
const updateInvoice = async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  const { items, taxRate, discount } = req.body;

  if (items) {
    const { subtotal, taxAmount, total } = calculateTotals(items, taxRate, discount);
    req.body.subtotal = subtotal;
    req.body.taxAmount = taxAmount;
    req.body.total = total;
    req.body.amountDue = total - (req.body.amountPaid || invoice.amountPaid);

    req.body.items = items.map(item => ({
      ...item,
      quantity: parseFloat(item.quantity) || 1,
      rate: parseFloat(item.rate) || 0,
      amount: (parseFloat(item.quantity) || 1) * (parseFloat(item.rate) || 0),
    }));
  }

  Object.assign(invoice, req.body);
  const updated = await invoice.save();
  res.json(updated);
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {
  const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json({ message: 'Invoice deleted' });
};

// @desc    Get dashboard stats
// @route   GET /api/invoices/stats
const getDashboardStats = async (req, res) => {
  const userId = req.user._id;

  const [invoices, recentInvoices] = await Promise.all([
    Invoice.find({ userId }),
    Invoice.find({ userId }).sort({ createdAt: -1 }).limit(5),
  ]);

  const totalInvoices = invoices.length;
  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((s, inv) => s + inv.total, 0);
  const pendingAmount = invoices.filter(inv => ['sent', 'partial'].includes(inv.status)).reduce((s, inv) => s + inv.amountDue, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((s, inv) => s + inv.amountDue, 0);

  res.json({
    totalInvoices,
    totalRevenue,
    pendingAmount,
    overdueCount,
    overdueAmount,
    recentInvoices,
  });
};

// @desc    Get due reminders
// @route   GET /api/invoices/reminders
const getReminders = async (req, res) => {
  const userId = req.user._id;
  const today = new Date();
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const overdue = await Invoice.find({
    userId,
    status: 'overdue',
  }).sort({ dueDate: 1 });

  const dueSoon = await Invoice.find({
    userId,
    status: { $in: ['sent', 'partial'] },
    dueDate: { $gte: today, $lte: sevenDaysLater },
  }).sort({ dueDate: 1 });

  res.json({ overdue, dueSoon });
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, getDashboardStats, getReminders };
