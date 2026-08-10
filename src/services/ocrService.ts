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
  const [keys, categories] = await Promise.all([
    getApiKeys(),
    fetchCategories()
  ]);
  
  if (!keys || keys.length === 0) {
    throw new Error("ไม่มี API Key กรุณาตั้งค่าในหน้า Settings ก่อนใช้งาน");
  }

  // 1. Run Tesseract Offline OCR
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

  const categoryListStr = Object.keys(categories).filter(k => categories[k].tab !== 'income').join(', ');
  const finalPrompt = PROMPT_TEMPLATE(categoryListStr) + `\n"""\n${extractedText}\n"""\n`;

  if (activeKeyIndex >= keys.length) activeKeyIndex = 0;

  let currentKey = keys[activeKeyIndex];
  let attempt = 0;
  
  while (attempt < keys.length) {
    try {
      console.log(`[OCR] Using Gemini API Key index ${activeKeyIndex}...`);
      const genAI = new GoogleGenerativeAI(currentKey);
      
      const modelConfigs = [
        { model: "gemini-2.5-flash", apiVersion: "v1beta" }, // Added back per user request
        { model: "gemini-2.0-flash", apiVersion: "v1beta" }
      ];
      let result;
      let lastError;
      let hasQuotaError = false;
      
      for (const config of modelConfigs) {
        try {
          console.log(`[OCR] Trying model: ${config.model} (API: ${config.apiVersion})`);
          const model = genAI.getGenerativeModel(
            { model: config.model },
            { apiVersion: config.apiVersion }
          );
          result = await model.generateContent([finalPrompt]);
          break; // Success!
        } catch (e: any) {
          lastError = e;
          if (e?.message?.includes('429') || e?.status === 429) {
            hasQuotaError = true;
          }
          console.warn(`[OCR] Model ${config.model} (${config.apiVersion}) failed (${e?.message || e?.status}). Trying next...`);
        }
      }
      
      if (!result) {
        if (hasQuotaError) {
          throw new Error("429: Quota exceeded on one or more models");
        }
        throw new Error(`All models failed. Last error: ${lastError?.message}`);
      }
      
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown code blocks if AI added them
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
        return {
          rawText: text,
        };
      }
      
    } catch (error: any) {
      console.error(`[OCR] Error with Key index ${activeKeyIndex}:`, error);
      
      // Check if it's a quota error (429)
      const isQuotaError = error?.message?.includes('429') || error?.status === 429;
      
      if (isQuotaError && keys.length > 1) {
        console.warn(`[OCR] Key ${activeKeyIndex} quota exceeded. Rotating key...`);
        activeKeyIndex = (activeKeyIndex + 1) % keys.length;
        currentKey = keys[activeKeyIndex];
        attempt++;
      } else {
        // Other errors or no more keys to try
        throw error;
      }
    }
  }
  
  throw new Error("API Keys ทั้งหมดเกินโควต้าการใช้งานแล้ว กรุณาลองใหม่ภายหลัง");
};
