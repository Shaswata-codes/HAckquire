const { GoogleGenerativeAI } = require('@google/generative-ai');
const { detectLanguage, SUPPORTED_LANGUAGES } = require('./translatorService');

/**
 * Multilingual AI Invoice Extraction Service
 * Extracts structured invoice data from natural language in ANY language (Hindi, Bengali, Tamil, Telugu, Hinglish, etc.)
 * Powered by Gemini AI with high-resilience Indic heuristic fallback engine.
 */

function normalizeIndicNumerals(str) {
  if (!str) return '';
  const indicDigits = {
    '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9',
    '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9',
    '౦':'0','౧':'1','౨':'2','౩':'3','౪':'4','౫':'5','౬':'6','౭':'7','౮':'8','౯':'9',
    '௦':'0','௧':'1','௨':'2','௩':'3','௪':'4','௫':'5','௬':'6','௭':'7','௮':'8','௯':'9'
  };
  return str.replace(/[०-९০-৯౦-౯௦-௯]/g, d => indicDigits[d] || d);
}

// Multilingual Indic Heuristic Fallback Parser
function heuristicParse(rawText) {
  const text = normalizeIndicNumerals(rawText);
  const detectedLangCode = detectLanguage(rawText);
  const languageName = SUPPORTED_LANGUAGES[detectedLangCode] || 'English';

  // 1. Extract Client Name (English & Indic particles)
  let clientName = '';
  const clientMatch = 
    text.match(/(?:for|to|client|customer|ka|ke liye|ki|er|ku|na|kosam)\s+([A-Za-z\u0900-\u0D7F]+)/i) ||
    text.match(/^([A-Za-z\u0900-\u0D7F]+)(?:'s|'|s|\s+ka|\s+er|\s+ku|\s+ki|\s+का|\s+এর|\s+க்கு)?\s+/i) ||
    text.match(/([A-Za-z\u0900-\u0D7F]+)\s+(?:का|के लिए|এর|க்கு|కోసం)/i);

  if (clientMatch) {
    clientName = clientMatch[1].replace(/('s|'|s|এর|का|க்கு)$/i, '').trim();
  }

  // 2. Extract Due Days (e.g., "7 days", "7 din", "7 दिन", "৭ দিন", "7 natkal")
  let dueInDays = 7;
  const dueMatch = 
    text.match(/(?:due\s+in|within|din\s+me|din\s+mein|diner\s+moddhe|natkalil)\s*(\d+)/i) ||
    text.match(/(\d+)\s*(?:days?|din|dino|diner|दिन|நாட்கள்|రోజులు)\s*(?:में|moddhe|il|due|payment)?/i);
  if (dueMatch && !isNaN(parseInt(dueMatch[1], 10))) {
    const d = parseInt(dueMatch[1], 10);
    if (d >= 1 && d <= 90) dueInDays = d;
  }

  // Remove payment due phrases and days from item processing so days aren't mistaken for rates
  const cleanItemText = text
    .replace(/\d+\s*(?:days?|din|dino|diner|दिन|நாட்கள்|రోజులు)\s*(?:में|moddhe|il|due|payment|mein)?/gi, '')
    .replace(/(?:payment\s+due|due\s+in|पेमेंट\s+देना\s+है|पेमेंट\s+देना|पেমেন্ট|payment|देना\s+है)/gi, '');

  // 3. Extract Items and Rates
  const items = [];
  // Split by English and Vernacular conjunctions
  const parts = cleanItemText.split(/(?:and|aur|also|\+|r|ebong|ebang|matrum|mariyu|tatha|aur\s+bhi|evam|এবং|மற்றும்|మరియు|तथा|और|,|\.)(?![0-9])/i);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check quantity * rate pattern: e.g. "10 sessions at 500", "3 blouses at 350", "১০ টি ক্লাস ৫০০ টাকা"
    const qtyMatch = trimmed.match(/(\d+)\s*([A-Za-z\u0900-\u0D7F\s&'-]+?)\s*(?:at|for|@|prati|each|har|dar|টাকা|₹|Rs\.?|INR)?\s*(?:₹|INR|Rs\.?|रुपये|টাকা|ரூபாய்)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    if (qtyMatch) {
      const qty = parseInt(qtyMatch[1], 10);
      const desc = qtyMatch[2].replace(/^(of|for|ka|ki|er|to|টি|टा|ti)\s+/i, '').trim();
      const rate = parseFloat(qtyMatch[3].replace(/,/g, ''));
      if (desc && rate && desc.length > 1 && !desc.match(/^(din|days|payment|diner)/i)) {
        items.push({ description: desc, quantity: qty, rate });
        continue;
      }
    }

    // Standard rate extraction: e.g. "repaired AC for 2500", "AC repair kiya 2500 me", "फिल्टर बदला 600", "ফিল্টার পরিবর্তন ৬০০"
    const numMatch = trimmed.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);

    if (numMatch) {
      const rate = parseFloat(numMatch[1].replace(/,/g, ''));
      let desc = trimmed
        .replace(numMatch[0], '')
        .replace(/(₹|INR|Rs\.?|रुपये|টাকা|ரூபாய்|for|costing|at|@|me|mein|taka|rupaye|kiya|badla|lagaya|karechi|panniyachi|payment|due|in\s+\d+\s+days?)/gi, '')
        .trim();

      if (clientName) {
        desc = desc.replace(new RegExp(`^${clientName}('s|s|\\s+का|\\s+er)?\\s*`, 'i'), '').trim();
      }

      if (desc && rate && rate > 0 && desc.length > 1 && !desc.match(/^(din|days|payment)/i)) {
        items.push({ description: desc, quantity: 1, rate });
      }
    }
  }

  // Fallback if no items isolated
  if (items.length === 0) {
    const singleAmtMatch = text.match(/(?:₹|INR|Rs\.?|रुपये|টাকা|ரூபாய்)?\s*(\d+)/i);
    const amount = singleAmtMatch ? parseFloat(singleAmtMatch[1]) : 1000;
    items.push({
      description: text.slice(0, 50).trim() || 'Service Rendered',
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
    notes: rawText,
    taxRate: 0,
    detectedLanguage: detectedLangCode,
    languageName: languageName,
    source: 'multilingual_heuristic_parser'
  };
}

const extractInvoiceFromText = async (naturalLanguageText) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const detectedLang = detectLanguage(naturalLanguageText);
  const langName = SUPPORTED_LANGUAGES[detectedLang] || 'English / Hinglish';

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    console.log(`💡 Parsing with Multilingual Vernacular Heuristic Engine [Language: ${langName}]`);
    return {
      success: true,
      data: heuristicParse(naturalLanguageText)
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert multilingual invoice extraction and translation assistant for Indian gig workers and freelancers.
The input text may be in English, Hindi, Bengali, Tamil, Telugu, Kannada, Marathi, Gujarati, Malayalam, Punjabi, Hinglish, or any regional Indian dialect.

Input Text: "${naturalLanguageText}"

TASK:
1. Understand the language (detected as likely ${langName}).
2. Extract the Client Name (translate to English alphabet e.g. "Rahul", "Priya", "Meena", etc.).
3. Extract all Line Items / Services. Provide clean, professional English descriptions (with native script in parentheses if applicable e.g. "AC Servicing & Filter Replacement (एसी मरम्मत)").
4. Extract quantities and numerical rates in INR (numeric only, no currency symbols).
5. Extract payment due days (default to 7 if unspecified).
6. Provide notes preserving original instructions or terms.

RETURN STRICT JSON ONLY:
{
  "clientName": "extracted client name (e.g. Rahul Sharma)",
  "clientEmail": "extracted email or empty string",
  "clientPhone": "extracted phone number or empty string",
  "items": [
    {
      "description": "Professional item description in English",
      "quantity": 1,
      "rate": 2500
    }
  ],
  "dueInDays": 7,
  "notes": "Original notes or payment instructions",
  "taxRate": 0,
  "detectedLanguage": "${detectedLang}",
  "languageName": "${langName}"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const extractedData = JSON.parse(text);

    const sanitized = {
      clientName: String(extractedData.clientName || 'Client').trim(),
      clientEmail: String(extractedData.clientEmail || '').trim(),
      clientPhone: String(extractedData.clientPhone || '').trim(),
      items: (extractedData.items || []).map(item => ({
        description: String(item.description || '').trim(),
        quantity: parseFloat(item.quantity) || 1,
        rate: parseFloat(item.rate) || 0,
      })).filter(item => item.description),
      dueInDays: extractedData.dueInDays ? parseInt(extractedData.dueInDays, 10) : 7,
      notes: String(extractedData.notes || naturalLanguageText).trim(),
      taxRate: parseFloat(extractedData.taxRate) || 0,
      detectedLanguage: extractedData.detectedLanguage || detectedLang,
      languageName: extractedData.languageName || langName,
      source: 'gemini_multilingual_ai'
    };

    if (sanitized.items.length === 0) {
      sanitized.items = heuristicParse(naturalLanguageText).items;
    }

    return { success: true, data: sanitized };
  } catch (error) {
    console.warn(`Gemini AI extraction error (${error.message}), using Multilingual Heuristic Engine.`);
    return {
      success: true,
      data: heuristicParse(naturalLanguageText)
    };
  }
};

module.exports = { extractInvoiceFromText };
