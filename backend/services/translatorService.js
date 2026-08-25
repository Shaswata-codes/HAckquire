const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Vernacular & Regional Language Translation Engine for Hackquire
 * Supports 10+ Indian languages with phonetic pronunciation and offline fallback
 */

const SUPPORTED_LANGUAGES = {
  hi: 'Hindi (हिन्दी)',
  bn: 'Bengali (বাংলা)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  kn: 'Kannada (ಕನ್ನಡ)',
  mr: 'Marathi (मराठी)',
  gu: 'Gujarati (ગુજરાતી)',
  ml: 'Malayalam (മലയാളം)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  hinglish: 'Hinglish (हिंग्लिश)'
};

// Language script detection ranges
const SCRIPT_PATTERNS = {
  bn: /[\u0980-\u09FF]/, // Bengali
  ta: /[\u0B80-\u0BFF]/, // Tamil
  te: /[\u0C00-\u0C7F]/, // Telugu
  kn: /[\u0C80-\u0CFF]/, // Kannada
  gu: /[\u0A80-\u0AFF]/, // Gujarati
  ml: /[\u0D00-\u0D7F]/, // Malayalam
  pa: /[\u0A00-\u0A7F]/, // Gurmukhi (Punjabi)
  hi: /[\u0900-\u097F]/, // Devanagari (Hindi / Marathi)
};

// Offline dictionary fallback for common service, invoicing, and gig trade terms
const OFFLINE_DICTIONARY = {
  hi: {
    'Invoice': 'बिल / इनवॉइस',
    'Payment due': 'भुगतान की तारीख',
    'Total Amount': 'कुल राशि',
    'AC repair and service': 'एसी मरम्मत और सर्विस',
    'Filter replacement': 'फ़िल्टर बदलना',
    'Electrical wiring repair': 'बिजली वायरिंग मरम्मत',
    'Plumbing service': 'नलसाजी (प्लंबिंग) सेवा',
    'Mathematics tuition': 'गणित ट्यूशन',
    'Blouse tailoring': 'ब्लाउज सिलाई',
    'Ceiling fan installation': 'सीलिंग फैन लगाना'
  },
  bn: {
    'Invoice': 'চালান / ইনভয়েস',
    'Payment due': 'পরিশোধের মেয়াদ',
    'Total Amount': 'মোট টাকা',
    'AC repair and service': 'এসি মেরামত এবং সার্ভিস',
    'Filter replacement': 'ফিল্টার পরিবর্তন',
    'Electrical wiring repair': 'বৈদ্যুতিক তার মেরামত',
    'Plumbing service': 'প্লাম্বিং পরিষেবা',
    'Mathematics tuition': 'অঙ্ক টিউশন',
    'Blouse tailoring': 'ব্লাউজ সেলাই',
    'Ceiling fan installation': 'সিলিং ফ্যান লাগানো'
  },
  ta: {
    'Invoice': 'விலைப்பட்டியல் / இன்வாய்ஸ்',
    'Payment due': 'பணம் செலுத்த வேண்டிய தேதி',
    'Total Amount': 'மொத்த தொகை',
    'AC repair and service': 'ஏசி பழுது மற்றும் சேவை',
    'Filter replacement': 'வடிகட்டி மாற்றுதல்',
    'Electrical wiring repair': 'மின் வயரிங் பழுதுபார்ப்பு',
    'Plumbing service': 'குழாய் பழுதுபார்ப்பு சேவை',
    'Mathematics tuition': 'கணித பயிற்சி',
    'Blouse tailoring': 'ரவிக்கை தையல்',
    'Ceiling fan installation': 'மின்விசிறி பொருத்துதல்'
  },
  te: {
    'Invoice': 'ఇన్‌వాయిస్ / బిల్లు',
    'Payment due': 'చెల్లింపు గడువు',
    'Total Amount': 'మొత్తం సొమ్ము',
    'AC repair and service': 'ఏసీ రిపేర్ మరియు సర్వీసింగ్',
    'Filter replacement': 'ఫిల్టర్ మార్పిడి',
    'Electrical wiring repair': 'ఎలక్ట్రికల్ వైరింగ్ రిపేర్',
    'Plumbing service': 'ప్లంబింగ్ సేవ',
    'Mathematics tuition': 'గణితం ట్యూషన్',
    'Blouse tailoring': 'బ్లౌజ్ కుట్టుపని',
    'Ceiling fan installation': 'సీలింగ్ ఫ్యాన్ బిగించడం'
  }
};

/**
 * Detect language script or style of input text
 */
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';

  for (const [code, regex] of Object.entries(SCRIPT_PATTERNS)) {
    if (regex.test(text)) {
      return code;
    }
  }

  // Detect Hinglish patterns (e.g. "kiya", "badla", "hai", "bhai", "rupaye", "diner", "diyo")
  const hinglishMarkers = /\b(kiya|badla|lagaya|karechi|panniten|diyo|chahiye|rupya|rupaye|taka|paisa|pennam|ka|ke|ko|se|me|aur|diner|din|mein)\b/i;
  if (hinglishMarkers.test(text)) {
    return 'hinglish';
  }

  return 'en';
}

/**
 * Translate text into target Indian regional language
 */
async function translateText(text, targetLang = 'hi') {
  const normalizedLang = (targetLang || 'hi').toLowerCase().trim();
  const langName = SUPPORTED_LANGUAGES[normalizedLang] || 'Hindi';

  if (!text || !text.trim()) {
    return {
      source_text: '',
      target_language_code: normalizedLang,
      target_language_name: langName,
      translated_text: '',
      phonetic_romanized: '',
      engine: 'empty'
    };
  }

  // 1. Check offline dictionary first
  if (OFFLINE_DICTIONARY[normalizedLang] && OFFLINE_DICTIONARY[normalizedLang][text]) {
    return {
      source_text: text,
      target_language_code: normalizedLang,
      target_language_name: langName,
      translated_text: OFFLINE_DICTIONARY[normalizedLang][text],
      phonetic_romanized: text,
      engine: 'offline_dictionary'
    };
  }

  // 2. Try Gemini AI translation if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && !apiKey.startsWith('your_') && apiKey.trim().length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Translate the following text into natural, professional ${langName} (${normalizedLang}).
Also provide the romanized phonetic pronunciation (in English letters).

TEXT TO TRANSLATE:
"${text}"

OUTPUT STRICT JSON ONLY:
{
  "translated_text": "translation in native script or natural regional language",
  "phonetic_romanized": "romanized english pronunciation"
}`;

      const result = await model.generateContent(prompt);
      const resText = result.response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(resText);

      return {
        source_text: text,
        target_language_code: normalizedLang,
        target_language_name: langName,
        translated_text: parsed.translated_text || text,
        phonetic_romanized: parsed.phonetic_romanized || text,
        engine: 'gemini_ai'
      };
    } catch (e) {
      console.warn('Translator Service AI error, using fallback:', e.message);
    }
  }

  // 3. Fallback
  const fallbackTranslation = OFFLINE_DICTIONARY[normalizedLang]?.[text] || text;
  return {
    source_text: text,
    target_language_code: normalizedLang,
    target_language_name: langName,
    translated_text: fallbackTranslation,
    phonetic_romanized: text,
    engine: 'fallback'
  };
}

module.exports = {
  SUPPORTED_LANGUAGES,
  detectLanguage,
  translateText
};
