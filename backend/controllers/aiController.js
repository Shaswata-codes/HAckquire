const { extractInvoiceFromText } = require('../services/geminiService');
const { translateText, SUPPORTED_LANGUAGES } = require('../services/translatorService');

// @desc    Extract invoice data from natural language text (Multilingual)
// @route   POST /api/ai/invoice
// @access  Protected
const extractInvoice = async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 3) {
    return res.status(400).json({ 
      message: 'Please provide a description of the work done in English or any Indian language',
      example: 'राहुल का एसी रिपेयर किया ₹2500 में और फिल्टर बदला ₹600 में।'
    });
  }

  const result = await extractInvoiceFromText(text);

  if (!result.success) {
    return res.status(500).json({ 
      message: 'AI extraction failed. Please try again or enter details manually.',
      error: result.error 
    });
  }

  // Calculate suggested due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (result.data.dueInDays || 7));

  res.json({
    success: true,
    data: {
      ...result.data,
      suggestedDueDate: dueDate.toISOString().split('T')[0],
    },
    message: `Invoice data extracted successfully (${result.data.languageName || 'Auto-detected'}).`
  });
};

// @desc    Translate text into Indian regional language
// @route   POST /api/ai/translate
// @access  Protected
const translate = async (req, res) => {
  const { text, target_language } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text is required for translation' });
  }

  const result = await translateText(text, target_language || 'hi');
  res.json(result);
};

// @desc    Batch translate multiple strings
// @route   POST /api/ai/translate/batch
// @access  Protected
const translateBatch = async (req, res) => {
  const { texts, target_language } = req.body;

  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ message: 'texts array is required' });
  }

  const targetLang = target_language || 'hi';
  const translations = await Promise.all(
    texts.map(t => translateText(t, targetLang))
  );

  res.json({
    count: translations.length,
    target_language: targetLang,
    translations
  });
};

// @desc    Get list of supported vernacular languages
// @route   GET /api/ai/languages
// @access  Public / Protected
const getLanguages = (req, res) => {
  res.json({
    supported_languages: SUPPORTED_LANGUAGES
  });
};

module.exports = {
  extractInvoice,
  translate,
  translateBatch,
  getLanguages
};
