const express = require('express');
const router = express.Router();
const { extractInvoice } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// POST /api/ai/invoice - Extract invoice data from natural language
// This is the reusable AI service endpoint
router.post('/invoice', protect, extractInvoice);

module.exports = router;
