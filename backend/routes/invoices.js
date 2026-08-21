const express = require('express');
const router = express.Router();
const {
  getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice,
  getDashboardStats, getReminders
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/reminders', getReminders);
router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id').get(getInvoice).put(updateInvoice).delete(deleteInvoice);

module.exports = router;
