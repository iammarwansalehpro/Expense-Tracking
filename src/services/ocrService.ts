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
- bank (string): The SENDER's bank (ธนาคารต้นทาง/ผู้โอน) or the bank system used. E.g. "TTB", "KBank", "SCB", "Krungthai", "Bangkok Bank", "PromptPay", "GSB", "Krungsri", etc. 
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

  // ===== STEP 2: Vision AI Extraction (100% API) =====
  console.log("[OCR] Requesting AI Vision Extraction...");

  const keys = await getApiKeys();
  if (!keys || keys.length === 0) {
    throw new Error("ไม่มี API Key กรุณาตั้งค่าในหน้า Settings ก่อนใช้งาน");
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
          // Dynamically fetch available models to find the current Vision model
          let groqVisionModel = null;
          try {
            const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
              headers: { 'Authorization': `Bearer ${currentKey}` }
            });
            if (modelsRes.ok) {
              const data = await modelsRes.json();
              const visionModels = data.data.filter((m: any) => 
                m.id.toLowerCase().includes('vision') || 
                m.id.toLowerCase().includes('-vl') ||
                m.id.toLowerCase().includes('scout')
              );
              if (visionModels.length > 0) {
                const prodModel = visionModels.find((m: any) => !m.id.includes('preview'));
                groqVisionModel = prodModel ? prodModel.id : visionModels[0].id;
              }
            }
          } catch (e) {
            console.warn("Could not fetch Groq model list:", e);
          }

          let response;
          if (groqVisionModel) {
            console.log(`[OCR] Trying VISION model: ${groqVisionModel} on Groq`);
            const base64Url = await fileToBase64Url(imageFile);
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: groqVisionModel,
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
          } else {
            console.log(`[OCR] No Vision model found on Groq. Falling back to TEXT-ONLY model: llama-3.3-70b-versatile`);
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                  { role: "system", content: "You are a JSON extractor. Always return valid JSON." },
                  { role: "user", content: finalPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1
              })
            });
          }

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
          rawText: data.rawText || "AI Extracted",
          category: data.category,
        };
      } catch (parseErr) {
        console.error("JSON Parse Error:", parseErr, "Raw Text:", text);
        throw new Error("AI ตอบกลับมาผิดรูปแบบ (ไม่ใช่ JSON)");
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
        throw error;
      }
    }
  }

  throw new Error("API Keys ทั้งหมดมีปัญหา หรือโควต้าเต็ม กรุณาลองใหม่ภายหลัง");
};
