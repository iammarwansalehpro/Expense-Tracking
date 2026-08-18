import { ref, push, set, remove, serverTimestamp, get } from 'firebase/database';
import { db } from '../lib/firebase';
import type { Transaction, Wallet, TransactionType } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAppStore } from '../store/useAppStore';

const TRANSACTIONS_PATH = 'transactions';

export interface PaySaveBackupData {
  version: string;
  app: string;
  exportedAt: string;
  metadata: {
    totalTransactions: number;
    totalWallets: number;
    totalIncome: number;
    totalExpense: number;
  };
  transactions: Transaction[];
  wallets?: Wallet[];
  categories?: Record<string, any>;
  settings?: {
    dailyBudget?: number;
    theme?: string;
    language?: string;
  };
}

export interface ParsedImportTransaction {
  id?: string;
  date: string;
  time?: string;
  type: TransactionType;
  category: string;
  title: string;
  amount: number;
  walletName?: string;
  walletId?: string;
  note?: string;
  isDuplicate?: boolean;
}

export interface ImportValidationResult {
  isValid: boolean;
  fileType: 'json' | 'csv';
  fileName: string;
  fileSize: string;
  transactions: ParsedImportTransaction[];
  wallets?: Wallet[];
  categories?: Record<string, any>;
  settings?: any;
  stats: {
    totalCount: number;
    incomeCount: number;
    expenseCount: number;
    transferCount: number;
    totalIncome: number;
    totalExpense: number;
    duplicateCount: number;
    dateRange: { start: string; end: string } | null;
  };
  previewRows: ParsedImportTransaction[];
  errors: string[];
  warnings: string[];
}

/**
 * ----------------------------------------------------
 * 1. EXPORT UTILITIES (ส่งออกข้อมูล)
 * ----------------------------------------------------
 */

// Helper to trigger browser download
function triggerDownload(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTransactionsToCSV(
  transactions: Transaction[], 
  wallets: Wallet[], 
  filterRange: 'all' | 'this_month' | 'last_month' | 'this_year' = 'all'
) {
  const walletMap = new Map(wallets.map(w => [w.id, w.name]));
  const now = new Date();
  
  // Filter by date range if specified
  let filtered = transactions;
  if (filterRange === 'this_month') {
    filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  } else if (filterRange === 'last_month') {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    });
  } else if (filterRange === 'this_year') {
    filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === now.getFullYear();
    });
  }

  // UTF-8 BOM for Excel compatibility with Thai text
  const BOM = '\uFEFF';
  const headers = [
    'วันที่ (Date)',
    'เวลา (Time)',
    'ประเภท (Type)',
    'หมวดหมู่ (Category)',
    'รายการ (Title)',
    'จำนวนเงิน (Amount)',
    'กระเป๋าเงิน (Wallet)',
    'โน้ตช่วยจำ (Note)',
    'ผ่อนชำระ (Installment)'
  ];

  const rows = filtered.map(t => {
    const typeLabel = t.type === 'income' ? 'รายรับ' : t.type === 'expense' ? 'รายจ่าย' : 'โอนเงิน';
    const walletName = t.walletId ? walletMap.get(t.walletId) || t.walletId : 'กระเป๋าหลัก';
    const isInstallment = t.isInstallment ? `ผ่อน ${t.installmentMonths || 0} เดือน` : 'ไม่ผ่อน';
    
    return [
      `"${t.date || ''}"`,
      `"${t.time || ''}"`,
      `"${typeLabel}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.amount || 0,
      `"${walletName.replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
      `"${isInstallment}"`
    ].join(',');
  });

  const csvContent = BOM + [headers.join(','), ...rows].join('\r\n');
  const dateStr = now.toISOString().split('T')[0];
  triggerDownload(csvContent, 'text/csv;charset=utf-8;', `PaySave_Transactions_${dateStr}.csv`);
}

export function exportFullBackupJSON(
  transactions: Transaction[], 
  wallets: Wallet[], 
  categories?: Record<string, any>
) {
  const dailyBudget = useSettingsStore.getState().dailyBudget;
  const language = useSettingsStore.getState().language;
  const now = new Date();

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const backupData: PaySaveBackupData = {
    version: '1.0',
    app: 'PaySave',
    exportedAt: now.toISOString(),
    metadata: {
      totalTransactions: transactions.length,
      totalWallets: wallets.length,
      totalIncome,
      totalExpense
    },
    transactions,
    wallets,
    categories,
    settings: {
      dailyBudget,
      language
    }
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 16);
  triggerDownload(jsonString, 'application/json;charset=utf-8;', `PaySave_Backup_${dateStr}.json`);
}

/**
 * ----------------------------------------------------
 * 2. IMPORT & VALIDATION UTILITIES (นำเข้าและตรวจสอบ)
 * ----------------------------------------------------
 */

// Helper to format file size
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Robust CSV Line Splitter (handles quoted fields with commas)
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function validateImportFile(
  file: File, 
  existingTransactions: Transaction[], 
  wallets: Wallet[]
): Promise<ImportValidationResult> {
  const fileName = file.name;
  const fileSize = formatBytes(file.size);
  const isJson = fileName.toLowerCase().endsWith('.json');
  const isCsv = fileName.toLowerCase().endsWith('.csv') || fileName.toLowerCase().endsWith('.txt');

  if (!isJson && !isCsv) {
    return {
      isValid: false,
      fileType: 'json',
      fileName,
      fileSize,
      transactions: [],
      stats: { totalCount: 0, incomeCount: 0, expenseCount: 0, transferCount: 0, totalIncome: 0, totalExpense: 0, duplicateCount: 0, dateRange: null },
      previewRows: [],
      errors: ['รองรับเฉพาะไฟล์ .json หรือ .csv เท่านั้น'],
      warnings: []
    };
  }

  const content = await file.text();

  if (isJson) {
    return parseAndValidateJSON(content, fileName, fileSize, existingTransactions, wallets);
  } else {
    return parseAndValidateCSV(content, fileName, fileSize, existingTransactions, wallets);
  }
}

function parseAndValidateJSON(
  content: string, 
  fileName: string, 
  fileSize: string, 
  existingTransactions: Transaction[], 
  wallets: Wallet[]
): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(content);
    let rawTxs: any[] = [];
    let backupWallets: Wallet[] | undefined = undefined;
    let backupCategories: Record<string, any> | undefined = undefined;
    let backupSettings: any = undefined;

    if (Array.isArray(parsed)) {
      rawTxs = parsed;
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.transactions)) {
        rawTxs = parsed.transactions;
      }
      if (Array.isArray(parsed.wallets)) {
        backupWallets = parsed.wallets;
      }
      if (parsed.categories && typeof parsed.categories === 'object') {
        backupCategories = parsed.categories;
      }
      if (parsed.settings) {
        backupSettings = parsed.settings;
      }
    }

    if (rawTxs.length === 0) {
      errors.push('ไม่พบรายการธุรกรรมในไฟล์ JSON');
      return {
        isValid: false,
        fileType: 'json',
        fileName,
        fileSize,
        transactions: [],
        stats: { totalCount: 0, incomeCount: 0, expenseCount: 0, transferCount: 0, totalIncome: 0, totalExpense: 0, duplicateCount: 0, dateRange: null },
        previewRows: [],
        errors,
        warnings
      };
    }

    // Build wallet name-to-id and id-to-id map
    const walletMap = new Map<string, string>();
    wallets.forEach(w => {
      walletMap.set(w.id, w.id);
      walletMap.set(w.name.toLowerCase().trim(), w.id);
    });

    const defaultWalletId = wallets.find(w => w.isMain)?.id || wallets[0]?.id || '';

    let incomeCount = 0;
    let expenseCount = 0;
    let transferCount = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let duplicateCount = 0;

    const dates: string[] = [];

    const validTxs: ParsedImportTransaction[] = rawTxs.map((t, idx) => {
      const amount = Math.abs(Number(t.amount) || 0);
      const type: TransactionType = ['income', 'expense', 'transfer'].includes(t.type) ? t.type : 'expense';
      const category = t.category || 'อื่นๆ';
      const title = t.title || category || 'รายการนำเข้า';
      const date = t.date || new Date().toISOString().split('T')[0];
      const time = t.time || '12:00';
      const note = t.note || '';

      if (date) dates.push(date);

      if (type === 'income') {
        incomeCount++;
        totalIncome += amount;
      } else if (type === 'expense') {
        expenseCount++;
        totalExpense += amount;
      } else {
        transferCount++;
      }

      // Check duplicates
      const isDuplicate = existingTransactions.some(e => 
        e.date === date && 
        Math.abs(e.amount - amount) < 0.01 && 
        (e.title || '').trim().toLowerCase() === title.trim().toLowerCase() && 
        e.type === type
      );

      if (isDuplicate) duplicateCount++;

      // Match wallet
      let matchedWalletId = t.walletId && walletMap.has(t.walletId) ? walletMap.get(t.walletId) : undefined;
      if (!matchedWalletId && t.walletName) {
        matchedWalletId = walletMap.get(t.walletName.toLowerCase().trim());
      }
      if (!matchedWalletId) {
        matchedWalletId = defaultWalletId;
      }

      const walletObj = wallets.find(w => w.id === matchedWalletId);

      return {
        id: t.id,
        date,
        time,
        type,
        category,
        title,
        amount,
        walletId: matchedWalletId,
        walletName: walletObj?.name || 'กระเป๋าหลัก',
        note,
        isDuplicate
      };
    });

    dates.sort();
    const dateRange = dates.length > 0 ? { start: dates[0], end: dates[dates.length - 1] } : null;

    if (duplicateCount > 0) {
      warnings.push(`พบรายการที่อาจซ้ำกับข้อมูลเดิม ${duplicateCount} รายการ (ระบบมีตัวเลือกข้ามรายการซ้ำ)`);
    }

    return {
      isValid: validTxs.length > 0,
      fileType: 'json',
      fileName,
      fileSize,
      transactions: validTxs,
      wallets: backupWallets,
      categories: backupCategories,
      settings: backupSettings,
      stats: {
        totalCount: validTxs.length,
        incomeCount,
        expenseCount,
        transferCount,
        totalIncome,
        totalExpense,
        duplicateCount,
        dateRange
      },
      previewRows: validTxs.slice(0, 5),
      errors,
      warnings
    };

  } catch (e: any) {
    errors.push(`รูปแบบไฟล์ JSON ไม่ถูกต้อง: ${e.message || 'JSON parse error'}`);
    return {
      isValid: false,
      fileType: 'json',
      fileName,
      fileSize,
      transactions: [],
      stats: { totalCount: 0, incomeCount: 0, expenseCount: 0, transferCount: 0, totalIncome: 0, totalExpense: 0, duplicateCount: 0, dateRange: null },
      previewRows: [],
      errors,
      warnings
    };
  }
}

function parseAndValidateCSV(
  content: string, 
  fileName: string, 
  fileSize: string, 
  existingTransactions: Transaction[], 
  wallets: Wallet[]
): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Remove UTF-8 BOM if present
  const cleanContent = content.replace(/^\uFEFF/, '').trim();
  const rawLines = cleanContent.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (rawLines.length < 2) {
    errors.push('ไฟล์ CSV ว่างเปล่าหรือไม่มีข้อมูลแถวรายการ');
    return {
      isValid: false,
      fileType: 'csv',
      fileName,
      fileSize,
      transactions: [],
      stats: { totalCount: 0, incomeCount: 0, expenseCount: 0, transferCount: 0, totalIncome: 0, totalExpense: 0, duplicateCount: 0, dateRange: null },
      previewRows: [],
      errors,
      warnings
    };
  }

  // Parse Header Row
  const headerRow = parseCSVRow(rawLines[0]).map(h => h.toLowerCase().trim());
  
  // Smart column index finder
  let dateIdx = headerRow.findIndex(h => h.includes('date') || h.includes('วัน'));
  let timeIdx = headerRow.findIndex(h => h.includes('time') || h.includes('เวลา'));
  let typeIdx = headerRow.findIndex(h => h.includes('type') || h.includes('ประเภท'));
  let catIdx = headerRow.findIndex(h => h.includes('cat') || h.includes('หมวด'));
  let titleIdx = headerRow.findIndex(h => h.includes('title') || h.includes('name') || h.includes('รายการ') || h.includes('ชื่อ'));
  let amountIdx = headerRow.findIndex(h => h.includes('amount') || h.includes('ยอด') || h.includes('จำนวน') || h.includes('เงิน') || h.includes('price'));
  let walletIdx = headerRow.findIndex(h => h.includes('wallet') || h.includes('กระเป๋า') || h.includes('bank') || h.includes('บัญชี'));
  let noteIdx = headerRow.findIndex(h => h.includes('note') || h.includes('memo') || h.includes('โน้ต') || h.includes('บันทึก'));

  // Defaults if headers not named standardly
  if (dateIdx === -1) dateIdx = 0;
  if (amountIdx === -1) amountIdx = headerRow.findIndex((_, i) => i !== dateIdx);

  const walletMap = new Map<string, string>();
  wallets.forEach(w => {
    walletMap.set(w.id, w.id);
    walletMap.set(w.name.toLowerCase().trim(), w.id);
  });

  const defaultWalletId = wallets.find(w => w.isMain)?.id || wallets[0]?.id || '';

  let incomeCount = 0;
  let expenseCount = 0;
  let transferCount = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  let duplicateCount = 0;

  const dates: string[] = [];
  const validTxs: ParsedImportTransaction[] = [];

  for (let i = 1; i < rawLines.length; i++) {
    const cols = parseCSVRow(rawLines[i]);
    if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

    const rawDate = dateIdx >= 0 && cols[dateIdx] ? cols[dateIdx].trim() : '';
    const rawTime = timeIdx >= 0 && cols[timeIdx] ? cols[timeIdx].trim() : '12:00';
    const rawType = typeIdx >= 0 && cols[typeIdx] ? cols[typeIdx].trim().toLowerCase() : '';
    const rawCat = catIdx >= 0 && cols[catIdx] ? cols[catIdx].trim() : 'อื่นๆ';
    const rawTitle = titleIdx >= 0 && cols[titleIdx] ? cols[titleIdx].trim() : '';
    const rawAmountStr = amountIdx >= 0 && cols[amountIdx] ? cols[amountIdx].replace(/,/g, '').trim() : '0';
    const rawWallet = walletIdx >= 0 && cols[walletIdx] ? cols[walletIdx].trim() : '';
    const rawNote = noteIdx >= 0 && cols[noteIdx] ? cols[noteIdx].trim() : '';

    const amount = Math.abs(parseFloat(rawAmountStr) || 0);
    if (isNaN(amount) || amount <= 0) continue; // Skip invalid amounts

    // Normalize Date
    let normalizedDate = new Date().toISOString().split('T')[0];
    if (rawDate) {
      // Check if it's DD/MM/YYYY or YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        normalizedDate = rawDate;
      } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) {
        const [d, m, y] = rawDate.split('/');
        normalizedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      } else {
        const parsedD = new Date(rawDate);
        if (!isNaN(parsedD.getTime())) {
          normalizedDate = parsedD.toISOString().split('T')[0];
        }
      }
    }

    dates.push(normalizedDate);

    // Normalize Type
    let type: TransactionType = 'expense';
    if (rawType.includes('income') || rawType.includes('รับ') || rawType.includes('รายรับ') || rawType.includes('+')) {
      type = 'income';
    } else if (rawType.includes('transfer') || rawType.includes('โอน')) {
      type = 'transfer';
    }

    if (type === 'income') {
      incomeCount++;
      totalIncome += amount;
    } else if (type === 'expense') {
      expenseCount++;
      totalExpense += amount;
    } else {
      transferCount++;
    }

    const title = rawTitle || rawCat || 'รายการนำเข้า';

    // Duplicate Check
    const isDuplicate = existingTransactions.some(e => 
      e.date === normalizedDate && 
      Math.abs(e.amount - amount) < 0.01 && 
      (e.title || '').trim().toLowerCase() === title.trim().toLowerCase() && 
      e.type === type
    );

    if (isDuplicate) duplicateCount++;

    // Wallet matching
    let matchedWalletId = rawWallet ? walletMap.get(rawWallet.toLowerCase()) : undefined;
    if (!matchedWalletId) matchedWalletId = defaultWalletId;
    const walletObj = wallets.find(w => w.id === matchedWalletId);

    validTxs.push({
      date: normalizedDate,
      time: rawTime,
      type,
      category: rawCat,
      title,
      amount,
      walletId: matchedWalletId,
      walletName: walletObj?.name || 'กระเป๋าหลัก',
      note: rawNote,
      isDuplicate
    });
  }

  dates.sort();
  const dateRange = dates.length > 0 ? { start: dates[0], end: dates[dates.length - 1] } : null;

  if (validTxs.length === 0) {
    errors.push('ไม่สามารถอ่านข้อมูลแถวรายการใดๆ จากไฟล์ CSV ได้ กรุณาตรวจสอบหัวตารางและรูปแบบข้อมูล');
  }

  if (duplicateCount > 0) {
    warnings.push(`พบรายการที่อาจซ้ำกับข้อมูลเดิม ${duplicateCount} รายการ`);
  }

  return {
    isValid: validTxs.length > 0,
    fileType: 'csv',
    fileName,
    fileSize,
    transactions: validTxs,
    stats: {
      totalCount: validTxs.length,
      incomeCount,
      expenseCount,
      transferCount,
      totalIncome,
      totalExpense,
      duplicateCount,
      dateRange
    },
    previewRows: validTxs.slice(0, 5),
    errors,
    warnings
  };
}

/**
 * ----------------------------------------------------
 * 3. EXECUTE IMPORT (บันทึกข้อมูลนำเข้าลงฐานข้อมูล)
 * ----------------------------------------------------
 */

export async function executeImport(
  validation: ImportValidationResult,
  mode: 'merge' | 'replace',
  skipDuplicates: boolean,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; importedCount: number; message: string }> {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw new Error('กรุณาเข้าสู่ระบบก่อนนำเข้าข้อมูล');
  }

  let txsToImport = validation.transactions;
  if (skipDuplicates && mode === 'merge') {
    txsToImport = txsToImport.filter(t => !t.isDuplicate);
  }

  if (txsToImport.length === 0) {
    return {
      success: true,
      importedCount: 0,
      message: 'ไม่มีรายการใหม่ที่ต้องนำเข้า (รายการทั้งหมดเป็นรายการซ้ำ)'
    };
  }

  // 1. If mode === 'replace', clean existing user transactions first
  if (mode === 'replace') {
    try {
      const userTxQuery = ref(db, TRANSACTIONS_PATH);
      const snapshot = await get(userTxQuery);
      if (snapshot.exists()) {
        const updates: Record<string, null> = {};
        snapshot.forEach(child => {
          if (child.val().userId === user.uid) {
            updates[child.key!] = null;
          }
        });
        if (Object.keys(updates).length > 0) {
          await set(ref(db, TRANSACTIONS_PATH), {
            ...snapshot.val(),
            ...updates
          });
        }
      }
    } catch (err) {
      console.warn('Could not clear all previous transactions:', err);
    }
  }

  // 2. If wallets were included in backup and mode === 'replace', sync wallets
  if (validation.wallets && validation.wallets.length > 0 && mode === 'replace') {
    useWalletStore.getState().setWallets(validation.wallets);
  }

  // 3. Batch insert transactions
  let importedCount = 0;
  const total = txsToImport.length;

  for (let i = 0; i < total; i++) {
    const tx = txsToImport[i];
    const newTxRef = push(ref(db, TRANSACTIONS_PATH));
    
    await set(newTxRef, {
      userId: user.uid,
      amount: tx.amount,
      title: tx.title,
      type: tx.type,
      category: tx.category,
      date: tx.date,
      time: tx.time || '12:00',
      walletId: tx.walletId || '',
      note: tx.note || '',
      createdAt: serverTimestamp()
    });

    importedCount++;
    if (onProgress) {
      onProgress(importedCount, total);
    }
  }

  return {
    success: true,
    importedCount,
    message: `นำเข้าข้อมูลเรียบร้อยแล้วทั้งหมด ${importedCount} รายการ`
  };
}
