const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Invoice Extraction Service
 * Extracts structured invoice data from natural language input using Gemini AI
 * Features a smart regex/heuristic fallback if API key is not configured or offline.
 */

// Heuristic fallback parser
function heuristicParse(text) {
  // Extract client name
  let clientName = '';
  const clientMatch = text.match(/(?:for|to|client|customer)\s+([A-Z][a-z]+(?:'[s]*)?(?:\s+[A-Z][a-z]+)?)/i) ||
                      text.match(/^([A-Z][a-z]+(?:'[s]*)?)\s+/i);
  if (clientMatch) {
    clientName = clientMatch[1].replace(/'s$/i, '').trim();
  }

  // Extract due days
  let dueInDays = 7;
  const dueMatch = text.match(/(?:due\s+in|within)\s+(\d+)\s*days?/i) ||
                   text.match(/(\d+)\s*days?\s+due/i);
  if (dueMatch) {
    dueInDays = parseInt(dueMatch[1], 10);
  }

  // Extract items and rates
  const items = [];
  // Match patterns like "repaired AC for 2500", "filter for 600", "10 sessions at 500 each"
  const itemPatterns = [
    /([\w\s&]+?)\s+(?:for|at|costing|price)\s+(?:₹|INR|Rs\.?)\s*(\d+(?:,\d+)*(?:\.\d+)?)/gi,
    /(?:₹|INR|Rs\.?)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s+(?:for|towards)\s+([\w\s&]+)/gi,
    /(\d+)\s+([\w\s&]+?)\s+(?:for|at|@)\s+(?:₹|INR|Rs\.?)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:each|per)?/gi
  ];

  // Try matching multiple items split by 'and', 'also', commas, periods
  const parts = text.split(/(?:and|,|also|\.)(?![0-9])/i);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check qty * rate pattern: "10 sessions at ₹500 each" or "3 blouses for ₹350 each"
    const qtyRateMatch = trimmed.match(/(\d+)\s+([a-zA-Z\s]+?)\s+(?:at|for|@)\s*(?:₹|INR|Rs\.?)?\s*(\d+)/i);
    if (qtyRateMatch) {
      const qty = parseInt(qtyRateMatch[1], 10);
      const desc = qtyRateMatch[2].trim();
      const rate = parseFloat(qtyRateMatch[3]);
      if (desc && rate) {
        items.push({ description: desc, quantity: qty, rate });
        continue;
      }
    }

    // Check standard "repaired X for 2500"
    const standardMatch = trimmed.match(/([a-zA-Z\s&'-]+?)\s+(?:for|costing|at)\s*(?:₹|INR|Rs\.?)?\s*(\d+)/i);
    if (standardMatch) {
      let desc = standardMatch[1].replace(/^(repaired|installed|serviced|made|fixed|bought|replaced)\s+/i, (m) => m).trim();
      // clean client name from desc if present
      if (clientName) {
        desc = desc.replace(new RegExp(`${clientName}'?s?\\s*`, 'i'), '').trim();
      }
      const rate = parseFloat(standardMatch[2]);
      if (desc && rate && !desc.toLowerCase().includes('payment due')) {
        items.push({ description: desc, quantity: 1, rate });
      }
    }
  }

  // If no items extracted, fallback to entire string as single service with any detected amount
  if (items.length === 0) {
    const amountMatch = text.match(/(?:₹|INR|Rs\.?)\s*(\d+)/i) || text.match(/(\d+)\s*(?:₹|INR|Rs\.?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 1000;
    items.push({
      description: text.slice(0, 50).trim() || 'General Service',
      quantity: 1,
      rate: amount
    });
  }

  return {
    clientName: clientName || 'Client',
    clientEmail: '',
    clientPhone: '',
    items,
    dueInDays,
    notes: text,
    taxRate: 0
  };
}

const extractInvoiceFromText = async (naturalLanguageText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    console.log('💡 Using built-in NLP heuristic extractor (Configure GEMINI_API_KEY for Gemini AI)');
    return {
      success: true,
      data: heuristicParse(naturalLanguageText)
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an invoice data extraction assistant. Extract structured invoice data from the following natural language text.

Text: "${naturalLanguageText}"

Return a JSON object with this exact structure:
{
  "clientName": "extracted client name or empty string",
  "clientEmail": "extracted email or empty string",
  "clientPhone": "extracted phone or empty string",
  "items": [
    {
      "description": "item description",
      "quantity": 1,
      "rate": 0
    }
  ],
  "dueInDays": null or number of days until payment is due,
  "notes": "any additional notes or special instructions",
  "taxRate": 0 (extract if mentioned, otherwise 0)
}

Rules:
- Extract ALL items/services mentioned
- For quantities: use 1 if not specified
- For rates: extract the price in INR (remove ₹ symbol)
- dueInDays: extract if "payment due in X days" or similar is mentioned
- Do not calculate totals - just extract raw item data
- Return ONLY valid JSON, no markdown, no explanation`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const extractedData = JSON.parse(text);

    // Validate and sanitize the extracted data
    const sanitized = {
      clientName: String(extractedData.clientName || '').trim(),
      clientEmail: String(extractedData.clientEmail || '').trim(),
      clientPhone: String(extractedData.clientPhone || '').trim(),
      items: (extractedData.items || []).map(item => ({
        description: String(item.description || '').trim(),
        quantity: parseFloat(item.quantity) || 1,
        rate: parseFloat(item.rate) || 0,
      })).filter(item => item.description),
      dueInDays: extractedData.dueInDays ? parseInt(extractedData.dueInDays, 10) : 7,
      notes: String(extractedData.notes || '').trim(),
      taxRate: parseFloat(extractedData.taxRate) || 0,
    };

    return { success: true, data: sanitized };
  } catch (error) {
    console.warn('Gemini AI extraction error, falling back to heuristic parser:', error.message);
    return {
      success: true,
      data: heuristicParse(naturalLanguageText)
    };
  }
};

module.exports = { extractInvoiceFromText };
