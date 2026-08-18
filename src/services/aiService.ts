import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKeys, fetchCategories } from './transactionService';
import type { Wallet } from '@/types';
import { matchWalletFromVoice } from '@/utils/walletMatcher';

let activeKeyIndex = 0;

export interface VoiceExtractResult {
  amount?: number;
  title?: string;
  category?: string;
  type?: 'expense' | 'income' | 'transfer';
  walletId?: string;
  walletName?: string;
}

const VOICE_PROMPT_TEMPLATE = (categoriesList: string, walletsList: string) => `
You are a highly intelligent financial data extractor that parses spoken sentences (in Thai or English) into structured transaction data.
I will provide you with a text transcribed from a user's voice command.
Extract the transaction details and provide the output STRICTLY as a JSON object with no additional text or formatting.

The JSON must have the following keys:
- amount (number): The transaction amount. If not mentioned, return null.
- title (string): A short, clean title for the transaction based on context. Do not include payment method / wallet words (e.g. "จ่ายด้วยเงินสด", "รูดบัตรเครดิต", "ผ่านบัญชีกรุงไทย", "โอนจาก") in the title unless it is the core item being bought. E.g. "จ่ายค่ากาแฟ 60 บาท ด้วยเงินสด" -> "ค่ากาแฟ". E.g. "ซื้อของเซเว่น 150 รูดบัตร" -> "ของเซเว่น". If missing, return a default like "รายการใหม่".
- type (string): "expense" or "income" or "transfer". E.g. "จ่าย", "ซื้อ", "กิน", "รูด" -> expense. "ได้เงิน", "รับเงิน", "เงินเดือน" -> income. "โอนไป" -> transfer. Default to "expense".
- category (string): Analyze the text to infer the most appropriate category for this transaction. MUST be exactly one of these: [${categoriesList}]. If none fit perfectly, pick the closest one or return null.
- walletId (string or null): If the user mentions or implies a payment method, bank account, cash, or credit card, match it to one of the user's available wallets: [${walletsList}]. Return the exact "id" of the matching wallet. If no specific wallet or payment method is mentioned, return null.

If you are unsure of a value, provide null for it.

Example Inputs and Outputs:
Input: "จ่ายค่ากาแฟ 60 บาท ด้วยเงินสด"
Output: {"amount": 60, "title": "ค่ากาแฟ", "type": "expense", "category": "อาหาร", "walletId": "<id of cash wallet>"}

Input: "โอนเงิน 500 บาทให้แม่ ผ่านบัญชีกรุงไทย"
Output: {"amount": 500, "title": "โอนเงินให้แม่", "type": "expense", "category": "ครอบครัว", "walletId": "<id of KTB wallet>"}

Input: "ซื้อเสื้อผ้า 1200 รูดบัตรเครดิต"
Output: {"amount": 1200, "title": "ซื้อเสื้อผ้า", "type": "expense", "category": "ช้อปปิ้ง", "walletId": "<id of credit card wallet>"}

Input: "ได้เงินเดือน 50000 บาท เข้าบัญชีหลัก"
Output: {"amount": 50000, "title": "เงินเดือน", "type": "income", "category": "เงินเดือน", "walletId": "<id of main bank wallet>"}
`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const extractDataFromVoice = async (transcript: string, wallets: Wallet[] = []): Promise<VoiceExtractResult> => {
  const categories = await fetchCategories();

  const keys = await getApiKeys();
  const geminiKeys = keys.filter(k => !k.startsWith('gsk_')); // Filter out Groq keys
  
  if (!geminiKeys || geminiKeys.length === 0) {
    throw new Error("ไม่สามารถประมวลผลคำสั่งได้ในขณะนี้ กรุณาตรวจสอบการตั้งค่าระบบ");
  }

  const categoryListStr = Object.keys(categories).join(', ');
  const walletsListStr = wallets.map(w => `id: "${w.id}", name: "${w.name}", type: "${w.type}"${w.isMain ? ' (main)' : ''}`).join(' | ');
  const finalPrompt = VOICE_PROMPT_TEMPLATE(categoryListStr, walletsListStr) + `\n\nInput: "${transcript}"\nOutput: `;

  if (activeKeyIndex >= geminiKeys.length) activeKeyIndex = 0;

  let currentKey = geminiKeys[activeKeyIndex];
  let attempt = 0;
  const maxRetriesPerModel = 2; 

  const modelConfigs = [
    { model: 'gemini-2.5-flash', apiVersion: 'v1beta' },
    { model: 'gemini-3.5-flash', apiVersion: 'v1beta' }
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
            { model: config.model },
            { apiVersion: config.apiVersion }
          );

          const result = await model.generateContent([finalPrompt]);
          const response = await result.response;
          const text = response.text();
          
          const cleanJsonStr = text.replace(/```(?:json)?\n?/g, '').trim();
          
          try {
            const parsed = JSON.parse(cleanJsonStr);
            
            // Check if AI returned a valid walletId from wallets
            let matchedWallet = wallets.find(w => w.id === parsed.walletId);
            
            // If AI didn't find or returned null, use Local Smart Matcher fallback
            if (!matchedWallet) {
              matchedWallet = matchWalletFromVoice(transcript, wallets) || undefined;
            }

            return {
              amount: parsed.amount != null && !isNaN(Number(parsed.amount)) ? Number(parsed.amount) : undefined,
              title: typeof parsed.title === 'string' ? parsed.title : 'Voice Transaction',
              category: typeof parsed.category === 'string' ? parsed.category : undefined,
              type: ['expense', 'income', 'transfer'].includes(parsed.type) ? parsed.type : 'expense',
              walletId: matchedWallet?.id,
              walletName: matchedWallet?.name,
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
