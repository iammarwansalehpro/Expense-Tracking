import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKeys, fetchCategories } from './transactionService';

let activeKeyIndex = 0;

export interface VoiceExtractResult {
  amount?: number;
  title?: string;
  category?: string;
  type?: 'expense' | 'income' | 'transfer';
}

const VOICE_PROMPT_TEMPLATE = (categoriesList: string) => `
You are a highly intelligent financial data extractor that parses spoken sentences (in Thai or English) into structured transaction data.
I will provide you with a text transcribed from a user's voice command.
Extract the transaction details and provide the output STRICTLY as a JSON object with no additional text or formatting.

The JSON must have the following keys:
- amount (number): The transaction amount. If not mentioned, return null.
- title (string): A short title for the transaction based on context. E.g. "กินข้าวเย็นที่เซ็นทรัล" -> "ข้าวเย็น เซ็นทรัล". If missing, return a default like "รายการใหม่".
- type (string): "expense" or "income" or "transfer". E.g. "จ่าย", "ซื้อ", "กิน" -> expense. "ได้เงิน", "รับเงิน", "เงินเดือน" -> income. "โอนไป" -> transfer. Default to "expense".
- category (string): Analyze the text to infer the most appropriate category for this transaction. MUST be exactly one of these: [${categoriesList}]. If none fit perfectly, pick the closest one or return null.

If you are unsure of a value, provide null for it.

Example Inputs and Outputs:
Input: "จ่ายค่าเน็ตบ้าน 500 บาท"
Output: {"amount": 500, "title": "ค่าเน็ตบ้าน", "type": "expense", "category": "ค่าสาธารณูปโภค"}

Input: "ได้เงินเดือน 50000 บาท"
Output: {"amount": 50000, "title": "เงินเดือน", "type": "income", "category": "เงินเดือน"}

Input: "กินกาแฟสตาบัค 150 บาท"
Output: {"amount": 150, "title": "กาแฟสตาบัค", "type": "expense", "category": "อาหาร"}
`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const extractDataFromVoice = async (transcript: string): Promise<VoiceExtractResult> => {
  const categories = await fetchCategories();

  const keys = await getApiKeys();
  const geminiKeys = keys.filter(k => !k.startsWith('gsk_')); // Filter out Groq keys
  
  if (!geminiKeys || geminiKeys.length === 0) {
    throw new Error("ไม่สามารถประมวลผลคำสั่งได้ในขณะนี้ กรุณาตรวจสอบการตั้งค่าระบบ");
  }

  const categoryListStr = Object.keys(categories).join(', ');
  const finalPrompt = VOICE_PROMPT_TEMPLATE(categoryListStr) + `\n\nInput: "${transcript}"\nOutput: `;

  if (activeKeyIndex >= geminiKeys.length) activeKeyIndex = 0;

  let currentKey = geminiKeys[activeKeyIndex];
  let attempt = 0;
  const maxRetriesPerModel = 2; 

  const modelConfigs = [
    { model: 'gemini-1.5-flash' },
    { model: 'gemini-1.5-flash-latest' }
  ];

  while (attempt < geminiKeys.length) {
    let lastError = null;
    let hasQuotaError = false;

    const genAI = new GoogleGenerativeAI(currentKey);

    for (const config of modelConfigs) {
      let modelAttempt = 0;
      while (modelAttempt < maxRetriesPerModel) {
        try {
          const model = genAI.getGenerativeModel(
            { model: config.model }
          );

          const result = await model.generateContent([finalPrompt]);
          const response = await result.response;
          const text = response.text();
          
          const cleanJsonStr = text.replace(/```(?:json)?\n?/g, '').trim();
          
          try {
            const parsed = JSON.parse(cleanJsonStr);
            return {
              amount: parsed.amount != null && !isNaN(Number(parsed.amount)) ? Number(parsed.amount) : undefined,
              title: typeof parsed.title === 'string' ? parsed.title : 'Voice Transaction',
              category: typeof parsed.category === 'string' ? parsed.category : undefined,
              type: ['expense', 'income', 'transfer'].includes(parsed.type) ? parsed.type : 'expense',
            };
          } catch (e) {
            throw new Error('ไม่สามารถอ่านข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
          }

        } catch (error: any) {
          lastError = error;
          if (error?.status === 429 || String(error).includes('429')) {
            hasQuotaError = true;
            modelAttempt++;
            if (modelAttempt < maxRetriesPerModel) {
              await sleep(1000 * modelAttempt); 
            }
          } else {
            // Not a quota error, skip to next model
            break;
          }
        }
      }
    }

    if (hasQuotaError) {
      activeKeyIndex++;
      if (activeKeyIndex >= geminiKeys.length) activeKeyIndex = 0;
      currentKey = geminiKeys[activeKeyIndex];
      attempt++;
    } else {
      console.error("AI Error:", lastError);
      throw new Error("ระบบไม่สามารถประมวลผลคำสั่งเสียงของคุณได้ในขณะนี้ กรุณาลองพูดใหม่อีกครั้ง");
    }
  }

  throw new Error("ระบบไม่สามารถประมวลผลคำสั่งเสียงของคุณได้ในขณะนี้ กรุณาลองพูดใหม่อีกครั้ง");
};
