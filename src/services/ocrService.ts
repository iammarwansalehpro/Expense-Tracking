import { GoogleGenerativeAI } from '@google/generative-ai';
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

const PROMPT_TEMPLATE = (categoriesList: string) => `
You are an expert AI financial data extractor for Thai receipts, bank transfer slips, e-commerce order summaries, and billing statements (such as Shopee SPayLater, Lazada, Grab, 7-Eleven, supermarket receipts, credit card statements, and bank transfer slips).

Analyze the provided image carefully. The image may contain:
A) A SINGLE bank transfer slip (e.g. KBank, SCB, TTB, Krungthai, PromptPay, GSB, etc.).
B) A MULTI-ITEM statement / order history / receipt (e.g. Shopee SPayLater billing statement, Shopee order list, supermarket receipt, invoice, credit card statement) with multiple items and amounts.

For EACH transaction or line item found in the image, extract the following information. Return STRICTLY a JSON array of objects (e.g. [{...}, {...}]):

Each item in the array MUST have the following keys:
- amount (number): The exact transaction amount for this item (positive number).
- date (string): The date and time of the transaction in ISO format (YYYY-MM-DDTHH:mm). If only month/year is shown (e.g. "ก.ค. 2026"), use that month with year converted to Gregorian (e.g. 2569 -> 2026, e.g. "2026-07-15T12:00"). If date is not visible on the item, use the statement header date or current year-month.
- bank (string): The payment method, sender bank, or platform name. E.g. "SPayLater", "ShopeePay", "Shopee", "Lazada", "KBank", "SCB", "TTB", "PromptPay", "Credit Card", "Cash", etc.
- title (string): The clean, concise product or recipient name. Remove cluttered emojis at the start, but keep the meaningful product name intact (e.g. "🐱อกไก่ฟรีซดราย🐶ขนมฟรีซดราย2.5L" -> "อกไก่ฟรีซดราย ขนมฟรีซดราย 2.5L", "MICHELIN ใบปัดน้ำฝน..." -> "ใบปัดน้ำฝนหลัง MICHELIN", "(ส่งตรงจากโรงงาน)ถ่าน..." -> "ถ่านปิ้งย่างไร้ควัน กะลามะพร้าว 100%").
- rawText (string): Short snippet or original text of this item (max 100 chars).
- category (string): Analyze the item title and purpose to assign the MOST APPROPRIATE category for this expense. MUST be chosen from this list: [\${categoriesList}]. If none fit, pick the closest one (e.g. cat/pet food -> "สัตว์เลี้ยง", wiper/car -> "เดินทาง" or "ของใช้", shirt/clothes -> "ซื้อของ", food/drink -> "อาหาร").

Rules:
1. If the image has multiple product items (like Shopee SPayLater statement), extract ALL individual items separately as distinct objects in the JSON array.
2. If there are 8-10 items listed, return all 8-10 objects in the array.
3. If the image is a single bank transfer slip, return an array with exactly 1 object.
4. Output MUST be ONLY valid JSON with NO markdown explanation, NO backticks.

Example Output format:
[
  {"amount": 183.0, "date": "2026-07-15T12:00", "bank": "SPayLater", "title": "อกไก่ฟรีซดราย ขนมฟรีซดราย 2.5L", "rawText": "อกไก่ฟรีซดราย 2.5L ฿183", "category": "สัตว์เลี้ยง"},
  {"amount": 66.0, "date": "2026-07-15T12:00", "bank": "SPayLater", "title": "ถ่านปิ้งย่างไร้ควัน กะลามะพร้าว 100%", "rawText": "ถ่านปิ้งย่างไร้ควัน ฿66", "category": "ของใช้"}
]
`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const compressImage = (file: File, maxWidth = 1400, quality = 0.85): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file); // fallback to original
        }
      }, 'image/jpeg', quality);
    };
    img.onerror = () => resolve(file); // fallback to original
    img.src = url;
  });
};

const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      const base64Data = base64Url.split(',')[1];
      resolve({
        inlineData: { data: base64Data, mimeType: file.type },
      });
    };
    reader.readAsDataURL(file);
  });
};

export const extractDataFromSlip = async (imageFile: File): Promise<OCRResult[]> => {
  const categories = await fetchCategories();

  const keys = await getApiKeys();
  const geminiKeys = keys.filter(k => !k.startsWith('gsk_')); // Filter out Groq keys
  
  if (!geminiKeys || geminiKeys.length === 0) {
    throw new Error("ไม่มี API Key ของ Gemini (Google) กรุณาตั้งค่าในหน้า Settings ก่อนใช้งาน");
  }

  const categoryListStr = Object.keys(categories).filter(k => categories[k].tab !== 'income').join(', ');
  const finalPrompt = PROMPT_TEMPLATE(categoryListStr);

  const compressedFile = await compressImage(imageFile);
  const imagePart = await fileToGenerativePart(compressedFile);

  if (activeKeyIndex >= geminiKeys.length) activeKeyIndex = 0;

  let currentKey = geminiKeys[activeKeyIndex];
  let attempt = 0;
  const maxRetriesPerModel = 2; // Retry on 429

  // Order of free-tier preferred models
  const modelConfigs = [
    { model: "gemini-2.5-flash", apiVersion: "v1beta" },
    { model: "gemini-3.5-flash", apiVersion: "v1beta" }
  ];

  while (attempt < geminiKeys.length) {
    let resultText = "";
    let lastError = null;
    let hasQuotaError = false;

    const genAI = new GoogleGenerativeAI(currentKey);

    for (const config of modelConfigs) {
      if (resultText) break; // Already got result

      let modelAttempt = 0;
      while (modelAttempt < maxRetriesPerModel) {
        try {
          const model = genAI.getGenerativeModel(
            { model: config.model },
            { apiVersion: config.apiVersion }
          );
          
          const result = await model.generateContent([finalPrompt, imagePart]);
          const response = await result.response;
          resultText = response.text();
          break; // Success! Break out of model retry loop
        } catch (e: any) {
          lastError = e;
          const is429 = e?.message?.includes('429') || e?.status === 429;
          
          if (is429) {
            hasQuotaError = true;
            console.warn(`[OCR] Model ${config.model} returned 429 Rate Limit. Waiting 5 seconds before retry...`);
            await sleep(5000); // Exponential backoff/wait
            modelAttempt++;
          } else {
            console.warn(`[OCR] Model ${config.model} failed (${e?.message || e?.status}). Skipping model...`);
            break; // Break retry loop on non-429 error
          }
        }
      }
    }

    if (resultText) {
      resultText = resultText.replace(/```(?:json)?\n?/g, '').trim();
      try {
        const parsed = JSON.parse(resultText);
        let items: any[] = [];
        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.items)) {
            items = parsed.items;
          } else if (Array.isArray(parsed.transactions)) {
            items = parsed.transactions;
          } else {
            items = [parsed];
          }
        }

        const normalized: OCRResult[] = items
          .filter(item => item && (item.amount != null || item.title))
          .map(item => ({
            amount: item.amount != null && !isNaN(Number(item.amount)) ? Number(item.amount) : undefined,
            date: typeof item.date === 'string' ? item.date : undefined,
            title: typeof item.title === 'string' ? item.title.trim() : 'รายการที่สแกน',
            bank: typeof item.bank === 'string' ? item.bank : 'Slip',
            rawText: typeof item.rawText === 'string' ? item.rawText : 'AI Extracted',
            category: typeof item.category === 'string' ? item.category : undefined,
          }));

        if (normalized.length > 0) {
          return normalized;
        }
      } catch (parseErr) {
        console.error("JSON Parse Error:", parseErr, "Raw Text:", resultText);
        throw new Error("AI ตอบกลับมาผิดรูปแบบ (ไม่ใช่ JSON)");
      }
    }

    // If we reach here, the current key failed entirely.
    if (hasQuotaError && geminiKeys.length > 1) {
      console.warn(`[OCR] Key ${activeKeyIndex} quota exceeded completely. Rotating key...`);
      activeKeyIndex = (activeKeyIndex + 1) % geminiKeys.length;
      currentKey = geminiKeys[activeKeyIndex];
      attempt++;
    } else {
      if (hasQuotaError) {
        throw new Error("429: โควต้าสแกนสลิปเต็มชั่วคราว (Rate Limit) กรุณารอสักครู่แล้วสแกนใหม่ หรือเพิ่ม API Key อื่น");
      }
      throw new Error(`API failed. Last error: ${lastError?.message}`);
    }
  }

  throw new Error("ไม่สามารถสแกนสลิปได้ด้วย API Key ทั้งหมดที่มี");
};
