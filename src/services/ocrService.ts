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
You are a highly intelligent financial data extractor.
I will provide you with an image of a Thai bank transfer slip.
Extract the transaction details and provide the output STRICTLY as a JSON object with no additional text or formatting.

The JSON must have the following keys:
- amount (number): The exact transfer amount (exclude fees).
- date (string): The date and time of the transaction in ISO format (YYYY-MM-DDTHH:mm). Make sure to convert Buddhist year to Gregorian if necessary (e.g. 2569 -> 2026).
- bank (string): The SENDER's bank (ธนาคารต้นทาง/ผู้โอน) or the bank system used. E.g. "TTB", "KBank", "SCB", "Krungthai", "Bangkok Bank", "PromptPay", "GSB", "Krungsri", etc. 
- title (string): The name of the receiver (person or company) without titles like นาย/นาง.
- rawText (string): A short summary of the slip text, max 100 chars.
- category (string): Analyze the rawText, title, and bank to infer the most appropriate category for this expense. MUST be exactly one of these: [\${categoriesList}]. If none fit perfectly, pick the closest one or return null.

If you are unsure of a value, provide null for it.

Example JSON output:
{"amount": 100.0, "date": "2026-08-04T19:13", "bank": "TTB", "title": "วาสนา สาและ", "rawText": "โอนเงินสำเร็จ", "category": "อาหาร"}
`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const compressImage = (file: File, maxWidth = 1000, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
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

export const extractDataFromSlip = async (imageFile: File): Promise<OCRResult> => {
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
      resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        const data = JSON.parse(resultText);
        return {
          amount: data.amount,
          date: data.date,
          title: data.title,
          bank: data.bank,
          rawText: data.rawText || "AI Extracted",
          category: data.category,
        };
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
