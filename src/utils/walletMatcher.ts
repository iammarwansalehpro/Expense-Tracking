import type { Wallet } from '@/types';

// พจนานุกรมชื่อเรียก คำย่อ และคำพ้องความหมายของช่องทางชำระเงินในไทย
const BANK_ALIASES: Record<string, string[]> = {
  ktb: ['กรุงไทย', 'ktb', 'krungthai', 'เป๋าตัง', 'เน็กซ์', 'next'],
  kbank: ['กสิกร', 'กสิกรไทย', 'kbank', 'kasikorn', 'k-bank', 'k plus', 'เคพลัส'],
  scb: ['ไทยพาณิชย์', 'scb', 'แม่มณี', 'easy', 'อีซี่'],
  bbl: ['กรุงเทพ', 'bbl', 'bangkok bank', 'บัวหลวง', 'bualuang'],
  ttb: ['ทีทีบี', 'ttb', 'ทหารไทย', 'ธนชาต', 'tmb', 'thanachart'],
  bay: ['กรุงศรี', 'bay', 'krungsri', 'เคมะนาว', 'uchose', 'ยูชูส'],
  gsb: ['ออมสิน', 'gsb', 'mymo', 'มายโม'],
  baac: ['ธกส', 'ธ.ก.ส.', 'baac'],
  truemoney: ['ทรูมันนี่', 'truemoney', 'true money', 'ทรูวอลเล็ต', 'true wallet', 'ทรู'],
  citi_uob: ['ยูโอบี', 'uob', 'ซิตี้', 'citi', 'citibank'],
  spaylater: ['spaylater', 'spay', 'shopeepay', 'ช้อปปี้'],
};

const CREDIT_CARD_ALIASES = [
  'บัตรเครดิต', 'รูดบัตร', 'ตัดบัตร', 'เครดิตการ์ด', 'credit card', 'creditcard',
  'ktc', 'เคทีซี', 'cardx', 'การ์ดเอ็กซ์', 'first choice', 'firstchoice', 'เฟิร์สช้อย',
  'aeon', 'อิออน', 'citi', 'ซิตี้', 'uob', 'ยูโอบี', 'central the 1', 'the 1', 'spaylater'
];

const CASH_ALIASES = [
  'เงินสด', 'จ่ายสด', 'cash', 'แบงค์', 'เหรียญ', 'กระเป๋าตังค์', 'กระเป๋าเงินสด', 'เงินสดหลัก', 'ตังค์สด', 'สด'
];

const BANK_GENERAL_ALIASES = [
  'โอน', 'โอนเงิน', 'โอนผ่าน', 'ผ่านบัญชี', 'เข้าบัญชี', 'หักบัญชี', 'สแกน', 'สแกนจ่าย', 'พร้อมเพย์', 'promptpay', 'บัญชี', 'ธนาคาร', 'bank'
];

const GENERIC_PREFIXES = ['เงิน', 'บัญชี', 'กระเป๋า', 'บัตร', 'wallet', 'bank', 'card', 'หลัก'];

/**
 * ฟังก์ชันค้นหาและจับคู่กระเป๋าเงินจากประโยคคำสั่งเสียงอย่างชาญฉลาด
 * @param transcript ข้อความคำพูดของผู้ใช้
 * @param wallets รายการกระเป๋าเงินทั้งหมดของผู้ใช้
 * @returns Wallet ที่ตรงที่สุด หรือ null หากไม่พบการระบุ
 */
export function matchWalletFromVoice(transcript: string, wallets: Wallet[]): Wallet | null {
  if (!transcript || !wallets || wallets.length === 0) return null;

  const text = transcript.toLowerCase().trim();

  // 1. Tier 1: Exact Name Match (เรียงตามความยาวชื่อกระเป๋าจากมากไปน้อย)
  const sortedByLength = [...wallets].sort((a, b) => b.name.length - a.name.length);
  for (const wallet of sortedByLength) {
    const walletNameLower = wallet.name.toLowerCase().trim();
    if (walletNameLower && text.includes(walletNameLower)) {
      return wallet;
    }
  }

  // 2. Tier 2: Specific Bank/Card Brand Matching (KTB, SCB, KBank, KTC etc.)
  for (const [, aliases] of Object.entries(BANK_ALIASES)) {
    const matchedAlias = aliases.find(alias => text.includes(alias.toLowerCase()));
    if (matchedAlias) {
      // ค้นหากระเป๋าเงินของผู้ใช้ที่มีชื่อตรงกับ Alias นี้
      const matchedWallet = wallets.find(w => 
        aliases.some(alias => w.name.toLowerCase().includes(alias.toLowerCase()))
      );
      if (matchedWallet) return matchedWallet;

      // หากไม่มีกระเป๋าชื่อตรง ให้มองหากระเป๋า type === 'bank'
      const bankWallet = wallets.find(w => w.type === 'bank');
      if (bankWallet) return bankWallet;
    }
  }

  // 3. Tier 3: Substring / Prefix Matching for Custom Thai Wallet Names (หลังจากตัดคำทั่วไปออก)
  // เช่น ผู้ใช้ตั้งชื่อ "เงินเก็บไปเที่ยวญี่ปุ่น" หรือ "บัญชีออมสินเพื่อลูก"
  for (const wallet of sortedByLength) {
    let meaningfulName = wallet.name.toLowerCase().trim();
    for (const prefix of GENERIC_PREFIXES) {
      if (meaningfulName.startsWith(prefix)) {
        meaningfulName = meaningfulName.substring(prefix.length).trim();
      }
    }

    if (meaningfulName.length >= 3) {
      // ตรวจสอบว่า meaningfulName ทั้งหมด หรือ substring ของมัน ปรากฏในคำพูดหรือไม่
      for (let len = meaningfulName.length; len >= 3; len--) {
        const sub = meaningfulName.substring(0, len);
        if (text.includes(sub)) {
          return wallet;
        }
      }
    }
  }

  // 4. Tier 4: Credit Card Aliases Match
  const isCreditCardMentioned = CREDIT_CARD_ALIASES.some(alias => text.includes(alias.toLowerCase()));
  if (isCreditCardMentioned) {
    const specificCC = wallets.find(w => 
      w.type === 'credit_card' && CREDIT_CARD_ALIASES.some(alias => text.includes(alias) && w.name.toLowerCase().includes(alias))
    );
    if (specificCC) return specificCC;

    const anyCreditCard = wallets.find(w => w.type === 'credit_card');
    if (anyCreditCard) return anyCreditCard;
  }

  // 5. Tier 5: Cash Aliases Match
  const isCashMentioned = CASH_ALIASES.some(alias => {
    if (alias === 'สด') {
      return text.includes('จ่ายสด') || text.includes('เงินสด') || /\bสด\b| สด|สด$/.test(text);
    }
    return text.includes(alias.toLowerCase());
  });
  if (isCashMentioned) {
    const cashWallet = wallets.find(w => w.type === 'cash' || w.name.toLowerCase().includes('เงินสด'));
    if (cashWallet) return cashWallet;
  }

  // 6. Tier 6: General Bank / Transfer Keywords Match
  const isBankGeneralMentioned = BANK_GENERAL_ALIASES.some(alias => text.includes(alias.toLowerCase()));
  if (isBankGeneralMentioned) {
    const bankWallet = wallets.find(w => w.type === 'bank' || w.name.toLowerCase().includes('บัญชี') || w.name.toLowerCase().includes('ธนาคาร'));
    if (bankWallet) return bankWallet;
  }

  return null;
}
