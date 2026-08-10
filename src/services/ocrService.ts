import { GoogleGenerativeAI } from '@google/generative-ai';
import Tesseract from 'tesseract.js';
import { getApiKeys, fetchCategories } from './transactionService';

let activeKeyIndex = 0;

export interface OCRResult {
  amount?: number;
  date?: string;
  title?: string;
  rawText: string;
  bank?: string;
  category?: string;
}

// ============================================================
// Smart Local Parser - 100% Free, Offline, No API Required
// ============================================================

const THAI_MONTHS: Record<string, string> = {
  'ม.ค.': '01', 'มกราคม': '01', 'มค': '01',
  'ก.พ.': '02', 'กุมภาพันธ์': '02', 'กพ': '02',
  'มี.ค.': '03', 'มีนาคม': '03', 'มีค': '03',
  'เม.ย.': '04', 'เมษายน': '04', 'เมย': '04',
  'พ.ค.': '05', 'พฤษภาคม': '05', 'พค': '05',
  'มิ.ย.': '06', 'มิถุนายน': '06', 'มิย': '06',
  'ก.ค.': '07', 'กรกฎาคม': '07', 'กค': '07',
  'ส.ค.': '08', 'สิงหาคม': '08', 'สค': '08',
  'ก.ย.': '09', 'กันยายน': '09', 'กย': '09',
  'ต.ค.': '10', 'ตุลาคม': '10', 'ตค': '10',
  'พ.ย.': '11', 'พฤศจิกายน': '11', 'พย': '11',
  'ธ.ค.': '12', 'ธันวาคม': '12', 'ธค': '12',
  // Common OCR misreads
  'n.A.': '07', 'ก.ค': '07', 'n.a.': '07',
  'ม.ค': '01', 'ก.พ': '02', 'มี.ค': '03', 'เม.ย': '04',
  'พ.ค': '05', 'มิ.ย': '06', 'ส.ค': '08', 'ก.ย': '09',
  'ต.ค': '10', 'พ.ย': '11', 'ธ.ค': '12',
};

const BANK_PATTERNS: { patterns: RegExp[]; name: string }[] = [
  { patterns: [/กรุงไทย/i, /krungthai/i, /ktb/i], name: 'Krungthai' },
  { patterns: [/กสิกร/i, /kasikorn/i, /kbank/i], name: 'KBank' },
  { patterns: [/ไทยพาณิชย์/i, /scb/i, /siam\s*commercial/i], name: 'SCB' },
  { patterns: [/กรุงเทพ/i, /bangkok\s*bank/i, /bbl/i], name: 'Bangkok Bank' },
  { patterns: [/ทหารไทยธนชาต/i, /ttb/i, /tmb/i, /ทีเอ็มบี/i, /ทีทีบี/i], name: 'TTB' },
  { patterns: [/กรุงศรี/i, /krungsri/i, /bay/i], name: 'Krungsri' },
  { patterns: [/ออมสิน/i, /gsb/i, /government\s*savings/i], name: 'GSB' },
  { patterns: [/พร้อมเพย์/i, /promptpay/i, /prompt\s*pay/i], name: 'PromptPay' },
  { patterns: [/ธ\.?ก\.?ส/i, /baac/i, /เพื่อการเกษตร/i], name: 'BAAC' },
  { patterns: [/อาคารสงเคราะห์/i, /ghb/i], name: 'GHBank' },
  { patterns: [/ยูโอบี/i, /uob/i], name: 'UOB' },
  { patterns: [/ซีไอเอ็มบี/i, /cimb/i], name: 'CIMB' },
  { patterns: [/แลนด์/i, /lh\s*bank/i, /land/i], name: 'LH Bank' },
  { patterns: [/ทิสโก้/i, /tisco/i], name: 'TISCO' },
  { patterns: [/เกียรตินาคิน/i, /kkp/i], name: 'KKP' },
];

/**
 * Extract the transfer amount from OCR text.
 * Looks for patterns like "จำนวนเงิน 1,750.00" or just large numbers near currency keywords.
 */
function extractAmount(text: string): number | undefined {
  // Pattern 1: จำนวนเงิน ... number
  const amountPatterns = [
    /จ[ํำ]านวนเง[ิี]น\s*[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)/,
    /ยอดโอน\s*[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)/,
    /ยอดเง[ิี]น\s*[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)/,
    /จ[ํำ]านวน\s*[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:บาท|un|uv|บ\.)/,
    /amount\s*[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /รวมเง[ิี]นท[ีี่]ช[ำํ]ระ\s*[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)/,
    /ยอดช[ำํ]ระ\s*[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)/,
    /ยอดรวมส[ุุ]ทธ[ิิ]\s*[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)/,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0) {
        console.log(`[LocalParser] Amount found: ${val}`);
        return val;
      }
    }
  }

  // Pattern 2: Find the largest number that looks like a money amount (has decimals)
  const allNumbers = [...text.matchAll(/([0-9,]+\.[0-9]{2})/g)];
  if (allNumbers.length > 0) {
    const amounts = allNumbers
      .map(m => parseFloat(m[1].replace(/,/g, '')))
      .filter(n => !isNaN(n) && n > 0);
    
    // Filter out 0.00 (fees) and pick the largest
    const nonZero = amounts.filter(n => n > 0.01);
    if (nonZero.length > 0) {
      const maxAmount = Math.max(...nonZero);
      console.log(`[LocalParser] Amount (largest number): ${maxAmount}`);
      return maxAmount;
    }
  }

  return undefined;
}

/**
 * Extract date from OCR text.
 * Handles Thai Buddhist calendar (พ.ศ.) and various date formats.
 */
function extractDate(text: string): string | undefined {
  // Pattern 1: "27 ก.ค. 2569 - 15:02" or "27 n.A. 2569 - 15:02"
  const datePatterns = [
    /(\d{1,2})\s+([ก-ฮ][ก-ฮ.\s]*[ก-ฮ.]\.?|n\.A\.?|n\.a\.?)\s*(\d{4})\s*[-–]\s*(\d{1,2}):(\d{2})/,
    /(\d{1,2})\s+([ก-ฮ][ก-ฮ.\s]*[ก-ฮ.]\.?|n\.A\.?|n\.a\.?)\s*(\d{4})/,
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})/,
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,
    /(\d{4})-(\d{2})-(\d{2})\s*T?(\d{2}):(\d{2})/,
  ];

  // Try Thai month name patterns first
  const thaiDateMatch = text.match(datePatterns[0]) || text.match(datePatterns[1]);
  if (thaiDateMatch) {
    const day = thaiDateMatch[1].padStart(2, '0');
    const monthText = thaiDateMatch[2].trim();
    let year = parseInt(thaiDateMatch[3]);
    const hour = thaiDateMatch[4] || '00';
    const minute = thaiDateMatch[5] || '00';

    // Convert Buddhist year to Gregorian
    if (year > 2500) year -= 543;

    // Find month number
    let monthNum = '01';
    for (const [key, val] of Object.entries(THAI_MONTHS)) {
      if (monthText.includes(key) || key.includes(monthText)) {
        monthNum = val;
        break;
      }
    }

    const result = `${year}-${monthNum}-${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    console.log(`[LocalParser] Date found: ${result}`);
    return result;
  }

  // Try DD/MM/YYYY format
  const slashMatch = text.match(datePatterns[2]) || text.match(datePatterns[3]);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    let year = parseInt(slashMatch[3]);
    if (year > 2500) year -= 543;
    if (year < 100) year += 2000;
    const hour = slashMatch[4] || '00';
    const minute = slashMatch[5] || '00';
    const result = `${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    console.log(`[LocalParser] Date found (slash): ${result}`);
    return result;
  }

  // Try ISO format
  const isoMatch = text.match(datePatterns[4]);
  if (isoMatch) {
    const result = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T${isoMatch[4]}:${isoMatch[5]}`;
    console.log(`[LocalParser] Date found (ISO): ${result}`);
    return result;
  }

  return undefined;
}

/**
 * Extract bank name from OCR text.
 */
function extractBank(text: string): string | undefined {
  let earliestMatch: { name: string, index: number } | null = null;
  
  for (const bank of BANK_PATTERNS) {
    for (const pattern of bank.patterns) {
      // Need to execute the regex to get the index. 
      // Ensure we have 'g' or 'i' flag without 'g' messing up lastIndex
      const regex = new RegExp(pattern.source, pattern.flags.replace('g', '') + 'g');
      let match;
      while ((match = regex.exec(text)) !== null) {
        if (!earliestMatch || match.index < earliestMatch.index) {
          earliestMatch = { name: bank.name, index: match.index };
        }
      }
    }
  }

  if (earliestMatch) {
    console.log(`[LocalParser] Bank found (earliest in text): ${earliestMatch.name}`);
    return earliestMatch.name;
  }
  
  return undefined;
}

/**
 * Extract receiver name from OCR text.
 * Looks for text after "ไปยัง" or "ถึง" or "ผู้รับ".
 */
function extractReceiverName(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Find index of "ไปยัง" or "ถึง" or "ผู้รับ"
  let receiverIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/ไปย[ัั]ง|ถ[ึึ]ง|ผ[ูู้]้?ร[ัั]บ/i.test(lines[i])) {
      receiverIdx = i;
      break;
    }
  }

  if (receiverIdx >= 0) {
    // The name is usually on the next line (or same line after the keyword)
    for (let j = receiverIdx; j < Math.min(receiverIdx + 3, lines.length); j++) {
      const line = lines[j];
      // Look for Thai name pattern: นาย/นาง/น.ส./นางสาว + name, or just Thai names
      const nameMatch = line.match(/(?:นาย|นาง(?:สาว)?|น\.?\s*ส\.?)\s*([\u0E00-\u0E7F\s]+)/);
      if (nameMatch) {
        const name = nameMatch[1].trim();
        if (name.length > 2) {
          console.log(`[LocalParser] Receiver found: ${name}`);
          return name;
        }
      }
      // Also try matching a line that's purely Thai text (likely a name)
      if (j > receiverIdx) {
        const pureThai = line.match(/^([\u0E00-\u0E7F\s.]+)$/);
        if (pureThai && pureThai[1].trim().length > 3 && !/พร้อมเพย์|PromptPay|XXX|บาท/i.test(line)) {
          console.log(`[LocalParser] Receiver found (pure Thai): ${pureThai[1].trim()}`);
          return pureThai[1].trim();
        }
      }
    }
  }

  // Fallback: look for name with title anywhere
  const namePatterns = [
    /(?:นาย|นาง(?:สาว)?|น\.?\s*ส\.?)\s*([\u0E00-\u0E7F\s]{4,})/g,
  ];
  for (const p of namePatterns) {
    const matches = [...text.matchAll(p)];
    // Skip the first match (likely sender), take the second (receiver)
    if (matches.length >= 2) {
      const name = matches[1][1].trim();
      console.log(`[LocalParser] Receiver found (2nd name): ${name}`);
      return name;
    }
    if (matches.length === 1) {
      // If only one name and we didn't find "ไปยัง", check context
      const name = matches[0][1].trim();
      console.log(`[LocalParser] Receiver found (only name): ${name}`);
      return name;
    }
  }

  return undefined;
}

/**
 * Main local parser: extracts structured data from raw OCR text without any API call.
 */
function parseSlipTextLocally(text: string): OCRResult {
  console.log("[LocalParser] Parsing text locally (no API)...");

  const amount = extractAmount(text);
  const date = extractDate(text);
  const bank = extractBank(text);
  const title = extractReceiverName(text);

  const summary = text.replace(/\s+/g, ' ').trim().slice(0, 100);

  const result: OCRResult = {
    amount,
    date,
    title,
    bank,
    rawText: summary || 'สแกนสลิป',
  };

  console.log("[LocalParser] Result:", JSON.stringify(result));
  return result;
}

// ============================================================
// Gemini AI Fallback (used only when local parser misses amount)
// ============================================================

const PROMPT_TEMPLATE = (categoriesList: string) => `
You are a highly intelligent financial data extractor.
I will provide you with the raw text extracted via OCR from a Thai bank transfer slip. The text might be messy, have typos, or contain mixed Thai/English characters.
Extract the transaction details and provide the output STRICTLY as a JSON object with no additional text or formatting.

The JSON must have the following keys:
- amount (number): The exact transfer amount (exclude fees).
- date (string): The date and time of the transaction in ISO format (YYYY-MM-DDTHH:mm). Make sure to convert Buddhist year to Gregorian if necessary (e.g. 2569 -> 2026).
- bank (string): The sender's bank or the bank system used. E.g. "TTB", "KBank", "SCB", "Krungthai", "Bangkok Bank", "PromptPay", "GSB", "Krungsri", etc. 
- title (string): The name of the receiver (person or company) without titles like นาย/นาง.
- rawText (string): A short summary of the OCR text, max 100 chars.
- category (string): Analyze the rawText, title, and bank to infer the most appropriate category for this expense. MUST be exactly one of these: [\${categoriesList}]. If none fit perfectly, pick the closest one or return null.

If you are unsure of a value, provide null for it.

Example JSON output:
{"amount": 100.0, "date": "2026-08-04T19:13", "bank": "TTB", "title": "วาสนา สาและ", "rawText": "โอนเงินสำเร็จ", "category": "อาหาร"}

RAW OCR TEXT:
`;

export const extractDataFromSlip = async (imageFile: File): Promise<OCRResult> => {
  const categories = await fetchCategories();

  // ===== STEP 1: Tesseract Offline OCR =====
  console.log("[OCR] Starting Tesseract.js (Offline text extraction)...");
  let extractedText = "";
  try {
    const worker = await Tesseract.createWorker('tha+eng');
    const ret = await worker.recognize(imageFile);
    extractedText = ret.data.text;
    await worker.terminate();
    console.log("[OCR] Tesseract extracted text:", extractedText);
  } catch (err) {
    console.error("[OCR] Tesseract failed:", err);
    throw new Error("ไม่สามารถอ่านตัวอักษรจากภาพได้ด้วย Tesseract");
  }

  // ===== STEP 2: Local Parser (FREE, no API) =====
  const localResult = parseSlipTextLocally(extractedText);

  // If we got the critical field (amount), return immediately - no API needed!
  if (localResult.amount && localResult.amount > 0) {
    console.log("[OCR] Local parser succeeded! No API call needed.");
    return localResult;
  }

  // ===== STEP 3: Gemini AI Fallback (only if local parser failed) =====
  console.log("[OCR] Local parser could not find amount. Falling back to Gemini AI...");

  const keys = await getApiKeys();
  if (!keys || keys.length === 0) {
    console.warn("[OCR] No API keys available. Returning local result as-is.");
    return localResult;
  }

  const categoryListStr = Object.keys(categories).filter(k => categories[k].tab !== 'income').join(', ');
  const finalPrompt = PROMPT_TEMPLATE(categoryListStr) + `\n"""\n${extractedText}\n"""\n`;

  if (activeKeyIndex >= keys.length) activeKeyIndex = 0;

  let currentKey = keys[activeKeyIndex];
  let attempt = 0;

  const fileToBase64Url = async (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const fileToGenerativePart = async (file: File) => {
    const base64Url = await fileToBase64Url(file);
    const base64Data = base64Url.split(',')[1];
    return {
      inlineData: { data: base64Data, mimeType: file.type },
    };
  };

  while (attempt < keys.length) {
    try {
      let result;
      let lastError;
      let hasQuotaError = false;
      let text = "";

      if (currentKey.startsWith('gsk_')) {
        // --- GROQ API (Vision) ---
        console.log(`[OCR] Using Groq API Key index ${activeKeyIndex}...`);
        try {
          console.log(`[OCR] Trying model: llama-3.2-90b-vision-preview on Groq`);
          const base64Url = await fileToBase64Url(imageFile);
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: "llama-3.2-90b-vision-preview",
              messages: [
                { role: "system", content: "You are a JSON extractor. Always return valid JSON." },
                { role: "user", content: [
                    { type: "text", text: finalPrompt },
                    { type: "image_url", image_url: { url: base64Url } }
                  ]
                }
              ],
              temperature: 0.1
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Groq API Error:", response.status, errorData);
            if (response.status === 429) {
              hasQuotaError = true;
            }
            throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'Groq request failed'}`);
          }

          result = await response.json();
          text = result.choices[0].message.content;
        } catch (e: any) {
          lastError = e;
          if (e?.message?.includes('429') || hasQuotaError) {
            hasQuotaError = true;
          }
          console.warn(`[OCR] Groq failed (${e?.message || e?.status}).`);
        }
      } else {
        // --- GEMINI API (Vision) ---
        console.log(`[OCR] Using Gemini API Key index ${activeKeyIndex}...`);
        const genAI = new GoogleGenerativeAI(currentKey);
        const imagePart = await fileToGenerativePart(imageFile);

        const modelConfigs = [
          { model: "gemini-2.5-flash", apiVersion: "v1beta" },
          { model: "gemini-2.0-flash", apiVersion: "v1beta" }
        ];

        for (const config of modelConfigs) {
          try {
            console.log(`[OCR] Trying model: ${config.model} (API: ${config.apiVersion})`);
            const model = genAI.getGenerativeModel(
              { model: config.model },
              { apiVersion: config.apiVersion }
            );
            // Send both prompt AND image
            result = await model.generateContent([finalPrompt, imagePart]);
            break;
          } catch (e: any) {
            lastError = e;
            if (e?.message?.includes('429') || e?.status === 429) {
              hasQuotaError = true;
            }
            console.warn(`[OCR] Model ${config.model} (${config.apiVersion}) failed (${e?.message || e?.status}). Trying next...`);
          }
        }
        
        if (result) {
          const response = await result.response;
          text = response.text();
        }
      }

      if (!text) {
        if (hasQuotaError) {
          throw new Error("429: Quota exceeded on one or more models");
        }
        throw new Error(`API failed. Last error: ${lastError?.message}`);
      }

      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const data = JSON.parse(text);
        return {
          amount: data.amount,
          date: data.date,
          title: data.title,
          bank: data.bank,
          rawText: data.rawText || "Gemini Extracted",
          category: data.category,
        };
      } catch (parseErr) {
        console.error("JSON Parse Error:", parseErr, "Raw Text:", text);
        return localResult; // Return local result if Gemini response is unparseable
      }

    } catch (error: any) {
      console.error(`[OCR] Error with Key index ${activeKeyIndex}:`, error);

      const isQuotaError = error?.message?.includes('429') || error?.status === 429;

      if (isQuotaError && keys.length > 1) {
        console.warn(`[OCR] Key ${activeKeyIndex} quota exceeded. Rotating key...`);
        activeKeyIndex = (activeKeyIndex + 1) % keys.length;
        currentKey = keys[activeKeyIndex];
        attempt++;
      } else {
        // If AI fails, still return local result instead of crashing
        console.warn("[OCR] Groq failed. Returning local parser result.");
        return localResult;
      }
    }
  }

  // All keys exhausted, return local result
  console.warn("[OCR] All API keys exhausted. Returning local parser result.");
  return localResult;
};
