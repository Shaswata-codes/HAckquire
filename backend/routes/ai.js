const express = require('express');
const router = express.Router();
const { 
  extractInvoice, 
  translate, 
  translateBatch, 
  getLanguages 
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// POST /api/ai/invoice - Extract invoice data from natural language (Multilingual)
router.post('/invoice', protect, extractInvoice);

// POST /api/ai/translate - Translate string into regional language with phonetic pronunciation
router.post('/translate', protect, translate);

// POST /api/ai/translate/batch - Batch translation
router.post('/translate/batch', protect, translateBatch);

// GET /api/ai/languages - List supported languages
router.get('/languages', getLanguages);

module.exports = router;
