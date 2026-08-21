const { extractInvoiceFromText } = require('../services/geminiService');

// @desc    Extract invoice data from natural language text
// @route   POST /api/ai/invoice
// @access  Protected
// This endpoint is designed as a reusable API that other teams can integrate
const extractInvoice = async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 5) {
    return res.status(400).json({ 
      message: 'Please provide a description of the work done',
      example: 'Repaired Rahul\'s AC for ₹2500 and replaced the filter for ₹600. Payment due in 7 days.'
    });
  }

  const result = await extractInvoiceFromText(text);

  if (!result.success) {
    return res.status(500).json({ 
      message: 'AI extraction failed. Please try again or enter details manually.',
      error: result.error 
    });
  }

  // Calculate a suggested due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (result.data.dueInDays || 7));

  res.json({
    success: true,
    data: {
      ...result.data,
      suggestedDueDate: dueDate.toISOString().split('T')[0],
    },
    message: 'Invoice data extracted successfully. Please review and edit before saving.'
  });
};

module.exports = { extractInvoice };
