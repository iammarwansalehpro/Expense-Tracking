import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, CheckCircle2, Upload, Download, Type, User, Tag, Plus, Trash2, 
  ArrowUpRight, ArrowDownRight, ShieldCheck, Lock, EyeOff, Database, 
  UserCheck, FileSpreadsheet, FileJson, AlertTriangle, Calendar, 
  Loader2, ChevronRight, FileCheck, FolderTree, Edit2
} from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useAppStore } from '@/store/useAppStore';
import { useThemeStore, type AppFont } from '@/store/useThemeStore';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  fetchCategories, 
  getApiKeys, 
  setApiKeys as saveApiKeysToDb,
  fetchAdminDefaultGroups,
  saveAdminDefaultGroups
} from '@/services/transactionService';
import { 
  exportTransactionsToCSV, 
  exportFullBackupJSON, 
  validateImportFile, 
  executeImport, 
  type ImportValidationResult 
} from '@/services/dataTransferService';
import { Settings as SettingsIcon, Info, Users } from 'lucide-react';
import { APP_VERSION } from '@/lib/constants';
import { useConfirmStore } from '@/store/useConfirmStore';
import { useToastStore } from '@/store/useToastStore';
import { 
  getCategoryStyle, 
  getAllCategoriesGrouped, 
  AVAILABLE_ICONS, 
  AVAILABLE_COLORS, 
  getIconComponent, 
  CATEGORY_SEED, 
  DEFAULT_EXPENSE_GROUPS,
  DEFAULT_INCOME_GROUPS,
  type DBCategory, 
  type CategoryTab 
} from '@/utils/categoryStyles';
import CustomSelect from '@/components/ui/CustomSelect';
import AutoShrinkText from '@/components/ui/AutoShrinkText';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Edit Profile Modal
export function EditProfileModal({ isOpen, onClose }: ModalProps) {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.displayName || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const showToast = useToastStore(s => s.showToast);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoUrl
      });
      setUser({ ...auth.currentUser });
      showToast(t('settings.editProfileModal.saveSuccess', 'อัปเดตโปรไฟล์สำเร็จ'), 'success');
      onClose();
    } catch (e: any) {
      showToast(e.message || t('settings.editProfileModal.saveError', 'Failed to update profile'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-[340px] animate-slide-up border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black mb-1 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            {t('settings.editProfileModal.title', 'แก้ไขโปรไฟล์')}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {t('settings.editProfileModal.subtitle', 'ปรับแต่งข้อมูลส่วนตัวของคุณ')}
          </p>
        </div>
        
        {/* Avatar Preview */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 shadow-inner flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl mb-3">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = ''; // reset on error
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = 'block';
                }}
              />
            ) : null}
            {!photoUrl && (
              <User className="w-10 h-10 text-purple-400 opacity-50" />
            )}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider mb-2 block text-slate-400 ml-1">
              {t('settings.editProfileModal.username', 'ชื่อผู้ใช้งาน')}
            </label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 outline-none border border-slate-200 dark:border-slate-700/50 transition-all"
              placeholder={t('settings.editProfileModal.usernamePlaceholder', 'กรอกชื่อของคุณ')}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {t('settings.editProfileModal.cancel', 'ยกเลิก')}
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-[1.5] py-3.5 rounded-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 disabled:opacity-50 hover:shadow-purple-500/50 transition-all active:scale-95">
            {loading ? t('settings.editProfileModal.saving', 'กำลังบันทึก...') : t('settings.editProfileModal.save', 'บันทึกข้อมูล')}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Font Selection Modal
export function FontSelectModal({ isOpen, onClose }: ModalProps) {
  const { t } = useTranslation();
  const { font, setFont } = useThemeStore();
  const fonts: AppFont[] = ['Noto Sans Thai', 'Prompt', 'Sarabun'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-2xl w-full max-w-[320px] animate-slide-up">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('settings.fontSelectModal.title', 'เลือกฟอนต์แอป')}
        </h3>
        <div className="space-y-3 mb-6">
          {fonts.map(f => (
            <button 
              key={f}
              onClick={() => {
                setFont(f);
                onClose();
              }}
              className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-between border ${font === f ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
              style={{ fontFamily: f }}
            >
              {f}
              {font === f && <CheckCircle2 size={18} />}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-3 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {t('settings.fontSelectModal.close', 'ปิด')}
        </button>
      </div>
    </div>
  );
}

// 3. About Modal
export function AboutModal({ isOpen, onClose }: ModalProps) {
  const { t } = useTranslation();
  const appName = useAppStore(s => s.appName);
  const appIconName = useAppStore(s => s.appIcon);
  const AppIcon = getIconComponent(appIconName);
  
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-[340px] animate-slide-up text-center border border-slate-100 dark:border-slate-800">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-white/90 to-white/40 dark:from-slate-800/90 dark:to-slate-800/40 backdrop-blur-xl rounded-[32px] flex items-center justify-center border border-white/60 dark:border-white/10 shadow-[0_12px_32px_rgba(46,16,101,0.08)] mb-6 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#A855F7]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[32px]" />
          {appIconName.startsWith('http') ? (
            <img src={appIconName} alt="App Icon" className="w-full h-full object-cover rounded-[32px]" />
          ) : (
            <AppIcon className="w-12 h-12 text-[#2E1065] dark:text-white drop-shadow-md relative z-10" />
          )}
        </div>
        <h3 className="text-3xl font-black tracking-tighter mb-1 bg-clip-text text-transparent bg-gradient-to-r from-[#2E1065] to-[#6D28D9] dark:from-purple-400 dark:to-pink-400 drop-shadow-sm">{appName}</h3>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold tracking-widest uppercase border border-purple-200 dark:border-purple-800/50 shadow-sm">
            v{APP_VERSION}
          </span>
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            {t('settings.aboutModal.latest', 'Latest')}
          </span>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
          {t('settings.aboutModal.description', 'แอปพลิเคชันจัดการการเงินระดับมืออาชีพ ที่ช่วยให้การจดบันทึกรายรับรายจ่ายของคุณเป็นเรื่องง่าย รวดเร็ว และแม่นยำมากยิ่งขึ้น')}
        </p>
        
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          {t('settings.aboutModal.ok', 'ตกลง')}
        </button>
      </div>
    </div>
  );
}

// 3.5 Privacy Policy Modal
export function PrivacyPolicyModal({ isOpen, onClose }: ModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const policies = [
    {
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      title: t('settings.privacyModal.p1Title', 'การเข้ารหัสและความปลอดภัยของข้อมูล'),
      desc: t('settings.privacyModal.p1Desc', 'ข้อมูลทางการเงินและรายการธุรกรรมทั้งหมดของคุณได้รับการปกป้องด้วยการเข้ารหัสความปลอดภัยระดับมาตรฐานสากล (TLS/HTTPS Encryption) ข้อมูลถูกจัดเก็บบนฐานข้อมูลที่มีการจำกัดสิทธิ์อย่างเข้มงวด'),
    },
    {
      icon: Lock,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      title: t('settings.privacyModal.p2Title', 'ความเป็นเจ้าของข้อมูลของผู้ใช้ (Data Ownership)'),
      desc: t('settings.privacyModal.p2Desc', 'คุณเป็นเจ้าของข้อมูลของคุณ 100% ระบบทำการแยกพื้นที่จัดเก็บข้อมูลตามบัญชีผู้ใช้งาน (User Isolation) อย่างเด็ดขาด ป้องกันไม่ให้ผู้อื่นสามารถเข้าถึงข้อมูลของคุณได้'),
    },
    {
      icon: EyeOff,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      title: t('settings.privacyModal.p3Title', 'ไม่เปิดเผยหรือขายข้อมูลให้บุคคลที่สาม'),
      desc: t('settings.privacyModal.p3Desc', 'เรายึดถือนโยบายไม่ขาย ไม่แลกเปลี่ยน และไม่เปิดเผยข้อมูลส่วนบุคคลหรือประวัติการใช้จ่ายของคุณให้กับตัวแทนโฆษณา หรือบุคคลภายนอกใดๆ ทั้งสิ้น ข้อมูลของคุณถูกใช้เพื่อการแสดงผลในแอปพลิเคชันของคุณเท่านั้น'),
    },
    {
      icon: Database,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      title: t('settings.privacyModal.p4Title', 'การจัดเก็บข้อมูลบนอุปกรณ์และคลาวด์'),
      desc: t('settings.privacyModal.p4Desc', 'แอปพลิเคชันจัดเก็บข้อมูลที่จำเป็นสำหรับการซิงค์ระหว่างอุปกรณ์ผ่านระบบคลาวด์ที่ปลอดภัย และบันทึกข้อมูลแคชในเครื่องของคุณเพื่อให้สามารถทำงานได้อย่างรวดเร็วและราบรื่น'),
    },
    {
      icon: UserCheck,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      title: t('settings.privacyModal.p5Title', 'สิทธิ์ในการควบคุมและลบข้อมูล (User Rights)'),
      desc: t('settings.privacyModal.p5Desc', 'คุณมีสิทธิ์เต็มที่ในการจัดการข้อมูลของคุณ ไม่ว่าจะเป็นการส่งออกข้อมูล (Export CSV/JSON), การแก้ไข, หรือการลบข้อมูลธุรกรรมทั้งหมดออกจากระบบได้ตลอดเวลาตามต้องการ'),
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white/95 dark:bg-[#1E1035]/95 backdrop-blur-2xl p-6 sm:p-7 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 dark:border-white/15 w-full max-w-md max-h-[85vh] flex flex-col animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#2E1065] dark:text-white tracking-tight">
                {t('settings.privacyModal.title', 'นโยบายความเป็นส่วนตัว')}
              </h3>
              <p className="text-[11px] font-semibold text-[#2E1065]/60 dark:text-white/60">
                {t('settings.privacyModal.subtitle', 'Privacy & Data Protection Policy')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3 pr-0.5">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {t('settings.privacyModal.banner', 'ข้อมูลทางการเงินของคุณเป็นความลับสูงสุดและได้รับการปกป้องตามมาตรฐาน')}
            </p>
          </div>

          {policies.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${p.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-[13px] text-[#2E1065] dark:text-white">
                    {p.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium pl-9.5">
                  {p.desc}
                </p>
              </div>
            );
          })}

          {/* Smart Auto-Fit Credit Badge */}
          <div className="pt-2.5 pb-1 px-1 flex justify-center">
            <div className="w-full max-w-[320px] py-1.5 px-3.5 rounded-full bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 shadow-xs flex items-center justify-center">
              <AutoShrinkText 
                origin="center" 
                className="text-[10.5px] font-bold text-slate-400 dark:text-slate-400/80 tracking-wider select-none"
              >
                Created by Marwan Saleh &copy; All rights reserved.
              </AutoShrinkText>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/10 shrink-0">
          <button 
            onClick={onClose} 
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#2E1065] to-[#4C1D95] text-white shadow-lg shadow-[#2E1065]/20 hover:opacity-95 active:scale-98 transition-all"
          >
            {t('settings.privacyModal.acknowledge', 'รับทราบและเข้าใจ')}
          </button>
        </div>

      </div>
    </div>
  );
}

// 4. Export / Import Data Modal (World-Class & Professional)
export function ExportImportModal({ isOpen, onClose }: ModalProps) {
  const { t, language } = useTranslation();
  const transactions = useTransactionStore(s => s.transactions);
  const wallets = useWalletStore(s => s.wallets);
  const appCategories = useAppStore(s => s.appCategories);
  const showToast = useToastStore(s => s.showToast);

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [filterRange, setFilterRange] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('all');
  
  // Import states
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset states when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setValidationResult(null);
      setImportProgress(null);
      setIsImporting(false);
      setShowPreview(false);
    }
  }, [isOpen]);

  // Filtered transactions calculation for export stats
  const filteredTxs = useMemo(() => {
    const now = new Date();
    if (filterRange === 'this_month') {
      return transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (filterRange === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      });
    } else if (filterRange === 'this_year') {
      return transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === now.getFullYear();
      });
    }
    return transactions;
  }, [transactions, filterRange]);

  const totalIncome = filteredTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  if (!isOpen) return null;

  // Handlers for Export
  const handleExportCSV = () => {
    try {
      exportTransactionsToCSV(transactions, wallets, filterRange);
      showToast(language === 'en' ? 'CSV file exported successfully' : 'ส่งออกไฟล์ CSV เรียบร้อยแล้ว', 'success');
    } catch (e: any) {
      showToast(e.message || 'Export error', 'error');
    }
  };

  const handleExportJSON = () => {
    try {
      exportFullBackupJSON(transactions, wallets, appCategories || undefined);
      showToast(language === 'en' ? 'Backup file exported successfully' : 'สำรองไฟล์ JSON เรียบร้อยแล้ว', 'success');
    } catch (e: any) {
      showToast(e.message || 'Export error', 'error');
    }
  };

  // Handlers for File Selection & Drag-n-Drop
  const handleFileSelect = async (file: File) => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await validateImportFile(file, transactions, wallets);
      setValidationResult(result);
      if (!result.isValid) {
        showToast(result.errors[0] || 'Invalid file format', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to parse file', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const doImport = async () => {
    if (!validationResult) return;
    setIsImporting(true);
    setImportProgress({ current: 0, total: validationResult.transactions.length });

    try {
      const res = await executeImport(
        validationResult, 
        importMode, 
        skipDuplicates, 
        (current, total) => {
          setImportProgress({ current, total });
        }
      );

      showToast(res.message, 'success');
      setValidationResult(null);
      setImportProgress(null);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Import error', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // Handler for Executing Import
  const handleStartImport = async () => {
    if (!validationResult || !validationResult.isValid) return;

    if (importMode === 'replace') {
      useConfirmStore.getState().showConfirm({
        title: language === 'en' ? 'Confirm Overwrite (Replace All)' : 'ยืนยันการเขียนทับข้อมูลเดิม',
        message: language === 'en' 
          ? 'Are you sure you want to replace all existing transactions with this file? Existing records cannot be recovered.'
          : 'คุณแน่ใจหรือไม่ที่จะล้างข้อมูลธุรกรรมเดิมทั้งหมด แล้วแทนที่ด้วยข้อมูลจากไฟล์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
        confirmText: language === 'en' ? 'Replace All' : 'เขียนทับทั้งหมด',
        cancelText: language === 'en' ? 'Cancel' : 'ยกเลิก',
        isDestructive: true,
        onConfirm: () => {
          doImport();
        }
      });
    } else {
      doImport();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white/95 dark:bg-[#1E1035]/95 backdrop-blur-2xl p-6 sm:p-7 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 dark:border-white/15 w-full max-w-md max-h-[90vh] flex flex-col animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6] shadow-sm">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#2E1065] dark:text-white tracking-tight">
                {t('dataTransfer.title', 'ส่งออก / นำเข้าข้อมูล')}
              </h3>
              <p className="text-[11px] font-semibold text-[#2E1065]/60 dark:text-white/60">
                {t('dataTransfer.subtitle', 'สำรองและจัดการข้อมูลธุรกรรมของคุณ')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100/80 dark:bg-white/5 rounded-2xl my-4 shrink-0 border border-slate-200/50 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'bg-white dark:bg-[#2E1065] text-[#2E1065] dark:text-white shadow-sm border border-slate-200/60 dark:border-white/20'
                : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{t('dataTransfer.tabExport', 'ส่งออกข้อมูล')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'import'
                ? 'bg-white dark:bg-[#2E1065] text-[#2E1065] dark:text-white shadow-sm border border-slate-200/60 dark:border-white/20'
                : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{t('dataTransfer.tabImport', 'นำเข้าข้อมูล')}</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto no-scrollbar pr-0.5 space-y-4">
          
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4 animate-fade-in">
              {/* Range Filter */}
              <div>
                <label className="text-xs font-bold text-[#2E1065] dark:text-white flex items-center gap-1.5 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  {t('dataTransfer.filterRange', 'ช่วงเวลาที่ต้องการส่งออก')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'all', label: t('dataTransfer.rangeAll', 'ทั้งหมด') },
                    { id: 'this_month', label: t('dataTransfer.rangeThisMonth', 'เดือนนี้') },
                    { id: 'last_month', label: t('dataTransfer.rangeLastMonth', 'เดือนที่แล้ว') },
                    { id: 'this_year', label: t('dataTransfer.rangeThisYear', 'ปีนี้') },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFilterRange(r.id as any)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                        filterRange === r.id
                          ? 'bg-[#2E1065] text-white shadow-sm'
                          : 'bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:bg-slate-200/60 dark:hover:bg-white/10'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Summary Badge */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-100 dark:border-purple-800/30 flex items-center justify-between text-xs font-bold text-[#2E1065] dark:text-white">
                <div>
                  <span className="opacity-60 block text-[10px] uppercase font-bold">{t('dataTransfer.selectedData', 'ข้อมูลที่เลือก')}</span>
                  <span className="text-sm font-black">{filteredTxs.length} {t('dataTransfer.items', 'รายการ')}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-600 dark:text-emerald-400 block">+฿{totalIncome.toLocaleString()}</span>
                  <span className="text-rose-600 dark:text-rose-400 block">-฿{totalExpense.toLocaleString()}</span>
                </div>
              </div>

              {/* Option 1: Excel CSV */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex flex-col gap-2.5 hover:border-emerald-400/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[13px] text-[#2E1065] dark:text-white flex items-center gap-2">
                        {t('dataTransfer.csvTitle', 'Excel / CSV Spreadsheet')}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-0.5">
                        <FileSpreadsheet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {t('dataTransfer.csvBadge', 'แนะนำสำหรับสรุปบัญชี')}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {t('dataTransfer.csvDesc', 'เหมาะสำหรับเปิดดูใน Excel, Google Sheets พร้อมรองรับภาษาไทย UTF-8 สมบูรณ์')}
                </p>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={filteredTxs.length === 0}
                  className="mt-1 w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('dataTransfer.exportBtn', 'ดาวน์โหลดไฟล์')} CSV (.csv)</span>
                </button>
              </div>

              {/* Option 2: JSON Backup */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex flex-col gap-2.5 hover:border-purple-400/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center shrink-0 border border-[#8B5CF6]/20">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[13px] text-[#2E1065] dark:text-white flex items-center gap-2">
                        {t('dataTransfer.jsonTitle', 'PaySave JSON Full Backup')}
                      </h4>
                      <span className="text-[10px] font-bold text-[#8B5CF6] dark:text-[#A78BFA] bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-[#8B5CF6]" />
                        {t('dataTransfer.jsonBadge', 'สำรองข้อมูลฉบับสมบูรณ์')}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {t('dataTransfer.jsonDesc', 'สำรองข้อมูลฉบับสมบูรณ์ (รายการ, กระเป๋าเงิน, การตั้งค่า) เพื่อนำไปกู้คืนบนเครื่องอื่น')}
                </p>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  disabled={transactions.length === 0}
                  className="mt-1 w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#2E1065] to-[#4C1D95] hover:opacity-95 active:scale-98 text-white shadow-md shadow-[#2E1065]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('dataTransfer.exportBtn', 'ดาวน์โหลดไฟล์')} JSON (.json)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4 animate-fade-in">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {/* State A: Upload Dropzone */}
              {!validationResult && !isValidating && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 scale-[1.02]'
                      : 'border-slate-300 dark:border-white/20 bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:bg-white/[0.06] hover:border-[#8B5CF6]/60'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6]/20 to-[#A855F7]/20 text-[#8B5CF6] flex items-center justify-center mb-3 shadow-inner">
                    <Download className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-[#2E1065] dark:text-white mb-1">
                    {t('dataTransfer.dropZoneTitle', 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('dataTransfer.dropZoneSub', 'รองรับไฟล์ .JSON (PaySave Backup) หรือ .CSV')}
                  </p>
                </div>
              )}

              {/* State B: Validating Spinner */}
              {isValidating && (
                <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center text-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
                  <span className="text-xs font-bold text-[#2E1065] dark:text-white">
                    {t('dataTransfer.validating', 'กำลังตรวจสอบไฟล์...')}
                  </span>
                </div>
              )}

              {/* State C: Validation Success & Ready to Import */}
              {validationResult && validationResult.isValid && !isImporting && (
                <div className="space-y-3.5 animate-scale-in">
                  
                  {/* File Info Pill */}
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block truncate">
                          {validationResult.fileName}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700/70 dark:text-emerald-400/70">
                          {validationResult.fileSize} • {validationResult.fileType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setValidationResult(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-white/10 text-xs font-bold text-slate-600 dark:text-white hover:bg-white shadow-xs shrink-0"
                    >
                      {t('dataTransfer.changeFile', 'เปลี่ยนไฟล์')}
                    </button>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {t('dataTransfer.totalRecords', 'จำนวนรายการ')}
                      </span>
                      <span className="text-base font-black text-[#2E1065] dark:text-white">
                        {validationResult.stats.totalCount} {t('dataTransfer.items', 'รายการ')}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
                        +{validationResult.stats.incomeCount} / -{validationResult.stats.expenseCount}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {t('dataTransfer.totalIncome', 'ยอดรวม')}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                        +฿{validationResult.stats.totalIncome.toLocaleString()}
                      </span>
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400 block">
                        -฿{validationResult.stats.totalExpense.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Duplicate warning if any */}
                  {validationResult.stats.duplicateCount > 0 && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>
                        {t('dataTransfer.duplicatesFound', 'พบรายการที่อาจซ้ำกับข้อมูลเดิม')} {validationResult.stats.duplicateCount} {t('dataTransfer.items', 'รายการ')}
                      </span>
                    </div>
                  )}

                  {/* Import Mode Radio Selection */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-[#2E1065] dark:text-white block">
                      {t('dataTransfer.importMode', 'โหมดการนำเข้าข้อมูล')}
                    </label>

                    <div 
                      onClick={() => setImportMode('merge')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        importMode === 'merge'
                          ? 'bg-[#8B5CF6]/10 border-[#8B5CF6] shadow-xs'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200/70 dark:border-white/10 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="radio" 
                          name="importMode" 
                          checked={importMode === 'merge'} 
                          onChange={() => setImportMode('merge')}
                          className="accent-[#8B5CF6]" 
                        />
                        <div>
                          <span className="text-xs font-bold text-[#2E1065] dark:text-white block">
                            {t('dataTransfer.modeMerge', 'รวมกับข้อมูลปัจจุบัน (Merge)')}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                            {t('dataTransfer.modeMergeDesc', 'เพิ่มรายการใหม่เข้าไป และคงข้อมูลเดิมไว้')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setImportMode('replace')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        importMode === 'replace'
                          ? 'bg-rose-500/10 border-rose-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200/70 dark:border-white/10 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="radio" 
                          name="importMode" 
                          checked={importMode === 'replace'} 
                          onChange={() => setImportMode('replace')}
                          className="accent-rose-500" 
                        />
                        <div>
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                            {t('dataTransfer.modeReplace', 'เขียนทับข้อมูลเดิมทั้งหมด (Replace)')}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                            {t('dataTransfer.modeReplaceDesc', 'ล้างข้อมูลธุรกรรมเดิมและแทนที่ด้วยข้อมูลจากไฟล์นี้')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skip duplicates toggle (when in merge mode) */}
                  {importMode === 'merge' && validationResult.stats.duplicateCount > 0 && (
                    <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={skipDuplicates}
                        onChange={(e) => setSkipDuplicates(e.target.checked)}
                        className="rounded accent-[#8B5CF6] w-4 h-4"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t('dataTransfer.skipDuplicates', 'ข้ามรายการที่ซ้ำกันอัตโนมัติ')}
                      </span>
                    </label>
                  )}

                  {/* Preview Toggle & Accordion */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-xs font-bold text-[#8B5CF6] hover:underline flex items-center gap-1"
                    >
                      <span>{showPreview ? t('dataTransfer.hidePreview', 'ซ่อนตัวอย่างข้อมูล') : t('dataTransfer.previewTitle', 'ดูตัวอย่างข้อมูล (5 รายการแรก)')}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showPreview ? 'rotate-90' : ''}`} />
                    </button>

                    {showPreview && (
                      <div className="mt-2 space-y-1.5 p-2 rounded-2xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 max-h-40 overflow-y-auto no-scrollbar">
                        {validationResult.previewRows.map((tx, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-between text-xs shadow-2xs">
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-[#2E1065] dark:text-white block truncate">{tx.title}</span>
                              <span className="text-[10px] text-slate-400">{tx.date} • {tx.category} • {tx.walletName}</span>
                            </div>
                            <span className={`font-black shrink-0 ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {tx.type === 'income' ? '+' : '-'}฿{tx.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Start Import Button */}
                  <button
                    type="button"
                    onClick={handleStartImport}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#2E1065] to-[#4C1D95] text-white shadow-lg shadow-[#2E1065]/20 flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('dataTransfer.btnImport', 'เริ่มนำเข้าข้อมูล')} ({validationResult.stats.totalCount} {t('dataTransfer.items', 'รายการ')})</span>
                  </button>
                </div>
              )}

              {/* State D: Importing in Progress */}
              {isImporting && (
                <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2E1065] dark:text-white mb-1">
                      {t('dataTransfer.importing', 'กำลังนำเข้าข้อมูล...')}
                    </h4>
                    {importProgress && (
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {importProgress.current} / {importProgress.total} {t('dataTransfer.items', 'รายการ')}
                      </span>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// 5. Admin App Info Modal
export function AdminAppInfoModal({ isOpen, onClose }: ModalProps) {
  const appNameStore = useAppStore(s => s.appName);
  const appSloganStore = useAppStore(s => s.appSlogan);
  const appIconStore = useAppStore(s => s.appIcon);
  const setAppInfo = useAppStore(s => s.setAppInfo);

  const [appName, setAppName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [appIcon, setAppIcon] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAppName(appNameStore);
      setSubtitle(appSloganStore);
      setAppIcon(appIconStore);
    }
  }, [isOpen, appNameStore, appSloganStore, appIconStore]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to Firebase (if needed)
      await set(ref(db, 'settings/appInfo'), {
        name: appName || 'PaySave',
        subtitle: subtitle || 'Smart Financial Assistant',
        icon: appIcon || 'Type'
      });
      
      // Update store directly
      setAppInfo(
        appName || 'PaySave', 
        subtitle || 'Smart Financial Assistant',
        appIcon || 'Type'
      );
      
      useToastStore.getState().addToast('ตั้งค่าแอปพลิเคชันสำเร็จ', 'success');
      onClose();
    } catch (e) {
      useToastStore.getState().addToast('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isUrl = appIcon.startsWith('http');
  const AppIconPreview = isUrl ? null : getIconComponent(appIcon || 'Type');

  return (
    <div className="fixed inset-0 z-[150] flex flex-col justify-end sm:items-center sm:justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        <div className="p-6 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-[20px] bg-blue-100 dark:bg-blue-900/50 text-blue-500 flex items-center justify-center">
              <Type size={24} strokeWidth={2.5} />
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">ตั้งค่าแอปพลิเคชัน</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">ปรับเปลี่ยนชื่อและสโลแกนของระบบ</p>
          
          <div className="space-y-5">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 mb-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Preview</label>
              <div className="flex items-center gap-3 text-slate-800 dark:text-white">
                <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm shrink-0 overflow-hidden border border-white/50">
                  {isUrl ? (
                    <img src={appIcon} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    AppIconPreview && <AppIconPreview className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[20px] leading-none tracking-tight">{appName || 'PaySave'}</span>
                  <span className="text-[10px] font-medium opacity-70 mt-0.5">{subtitle || 'Smart Financial Assistant'}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">URL รูปภาพไอคอนแอป</label>
              <input 
                type="text" 
                value={appIcon}
                onChange={(e) => setAppIcon(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                placeholder="https://example.com/icon.png"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">ชื่อแอปพลิเคชัน</label>
              <input 
                type="text" 
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                placeholder="PaySave"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">สโลแกน</label>
              <input 
                type="text" 
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                placeholder="จดปุ๊บ รู้ปั๊บ... จัดการเงินง่ายๆ สไตล์คุณ!"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900 shrink-0 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-[20px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[15px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
          >
            ยกเลิก
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-4 rounded-[20px] bg-blue-500 text-white font-bold text-[15px] shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>
  );
}

// 6. Admin Category & Group Modal (Full System Default CRUD)
export function AdminCategoryModal({ isOpen, onClose }: ModalProps) {
  const appCategories = useAppStore(s => s.appCategories);
  const [categories, setCategories] = useState<Record<string, DBCategory>>({});
  const [groups, setGroups] = useState<{ expense: string[], income: string[] }>({
    expense: [...DEFAULT_EXPENSE_GROUPS],
    income: [...DEFAULT_INCOME_GROUPS]
  });
  const [saving, setSaving] = useState(false);
  
  // Navigation & Filter state
  const [mainTab, setMainTab] = useState<'categories' | 'groups'>('categories');
  const [filterTab, setFilterTab] = useState<CategoryTab | 'all' | 'expense'>('expense');
  const [groupType, setGroupType] = useState<'expense' | 'income'>('expense');
  const [isManageMode, setIsManageMode] = useState(false);

  // Category Form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newTab, setNewTab] = useState<CategoryTab>('lifestyle');
  const [newGroup, setNewGroup] = useState('ไลฟ์สไตล์');
  const [newIcon, setNewIcon] = useState('Tag');
  const [newColorIdx, setNewColorIdx] = useState(0);

  // Group Form state
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<{
    isOpen: boolean;
    oldName: string;
    newName: string;
    type: 'expense' | 'income';
  }>({
    isOpen: false,
    oldName: '',
    newName: '',
    type: 'expense'
  });

  // Current active groups for selected category form tab
  const currentFormGroups = useMemo(() => {
    return newTab === 'income' ? groups.income : groups.expense;
  }, [newTab, groups]);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      if (appCategories && Object.keys(appCategories).length > 0) {
        setCategories({ ...appCategories });
      } else {
        setCategories({ ...CATEGORY_SEED });
      }

      fetchAdminDefaultGroups().then(adminGroups => {
        if (adminGroups) {
          setGroups(adminGroups);
        }
      });
    }
  }, [isOpen, appCategories]);

  // Update group when category tab changes
  useEffect(() => {
    if (!currentFormGroups.includes(newGroup)) {
      setNewGroup(currentFormGroups[0] || 'อื่นๆ');
    }
  }, [newTab, currentFormGroups, newGroup]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (filterTab === 'all') return categories;
    const filtered: Record<string, DBCategory> = {};
    Object.keys(categories).forEach(k => {
      const catTab = categories[k].tab;
      if (filterTab === 'expense' && (catTab === 'lifestyle' || catTab === 'fixed' || catTab === 'savings')) {
        filtered[k] = categories[k];
      } else if (catTab === filterTab) {
        filtered[k] = categories[k];
      }
    });
    return filtered;
  }, [categories, filterTab]);

  const groupedAll = useMemo(() => {
    const customOrder = filterTab === 'income' ? groups.income : groups.expense;
    return getAllCategoriesGrouped(Object.keys(filteredCategories), filteredCategories, customOrder);
  }, [filteredCategories, filterTab, groups]);

  // Group category counts
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(categories).forEach(cat => {
      counts[cat.group] = (counts[cat.group] || 0) + 1;
    });
    return counts;
  }, [categories]);

  if (!isOpen) return null;

  // Save All System Defaults (Categories + Groups)
  const handleSave = async () => {
    setSaving(true);
    try {
      await set(ref(db, 'app_categories'), categories);
      await saveAdminDefaultGroups(groups);
      useAppStore.getState().setAppCategories(categories);
      useToastStore.getState().addToast('บันทึกหมวดหมู่และกลุ่มเริ่มต้นของระบบสำเร็จ', 'success');
      onClose();
    } catch (e) {
      useToastStore.getState().addToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add / Update Category
  const handleAdd = () => {
    const cleanName = newName.trim();
    if (!cleanName) return;
    const colorObj = AVAILABLE_COLORS[newColorIdx] || AVAILABLE_COLORS[0];
    const newCatObj: DBCategory = {
      iconName: newIcon,
      color: colorObj.color + ' border-white/50',
      textColor: colorObj.textColor,
      tab: newTab,
      group: newGroup || 'อื่นๆ',
      isDefault: true,
      updatedAt: Date.now()
    };
    
    setCategories(prev => {
      const next = { ...prev };
      if (editingKey && editingKey !== cleanName) {
        delete next[editingKey];
      }
      next[cleanName] = newCatObj;
      return next;
    });
    
    setIsAdding(false);
    setEditingKey(null);
    setNewName('');
    setNewIcon('Tag');
  };

  const openAdd = () => {
    setEditingKey(null);
    setNewName('');
    const targetTab: CategoryTab = filterTab === 'income' ? 'income' : 'lifestyle';
    setNewTab(targetTab);
    const grps = targetTab === 'income' ? groups.income : groups.expense;
    setNewGroup(grps[0] || 'อื่นๆ');
    setNewIcon('Tag');
    setNewColorIdx(0);
    setIsAdding(true);
  };

  const openEdit = (catName: string) => {
    const cat = categories[catName];
    if (!cat) return;
    setEditingKey(catName);
    setNewName(catName);
    setNewTab(cat.tab);
    setNewGroup(cat.group);
    setNewIcon(cat.iconName);
    const colorIdx = AVAILABLE_COLORS.findIndex(c => c.color === cat.color.replace(' border-white/50', ''));
    setNewColorIdx(colorIdx >= 0 ? colorIdx : 0);
    setIsAdding(true);
  };

  const handleDelete = (catName: string) => {
    useConfirmStore.getState().showConfirm({
      title: 'ลบหมวดหมู่ระบบ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่เริ่มต้น "${catName}"?`,
      confirmText: 'ลบหมวดหมู่',
      cancelText: 'ยกเลิก',
      isDestructive: true,
      onConfirm: () => {
        setCategories(prev => {
          const next = { ...prev };
          delete next[catName];
          return next;
        });
        useToastStore.getState().addToast('ลบหมวดหมู่เรียบร้อยแล้ว', 'success');
      }
    });
  };

  // Group Actions (Admin)
  const handleAddGroup = () => {
    const clean = newGroupName.trim();
    if (!clean) return;
    const list = groupType === 'income' ? groups.income : groups.expense;
    if (list.includes(clean)) {
      useToastStore.getState().addToast('มีกลุ่มนี้อยู่แล้ว', 'error');
      return;
    }

    setGroups(prev => ({
      ...prev,
      [groupType]: [...prev[groupType], clean]
    }));
    setNewGroupName('');
    useToastStore.getState().addToast(`เพิ่มกลุ่ม "${clean}" สำเร็จ`, 'success');
  };

  const handleSaveRenameGroup = () => {
    const cleanNew = editingGroup.newName.trim();
    if (!cleanNew) return;
    if (cleanNew === editingGroup.oldName) {
      setEditingGroup(prev => ({ ...prev, isOpen: false }));
      return;
    }

    const list = editingGroup.type === 'income' ? groups.income : groups.expense;
    if (list.includes(cleanNew)) {
      useToastStore.getState().addToast('มีกลุ่มชื่อนี้อยู่แล้ว', 'error');
      return;
    }

    // Rename in group list
    setGroups(prev => ({
      ...prev,
      [editingGroup.type]: prev[editingGroup.type].map(g => g === editingGroup.oldName ? cleanNew : g)
    }));

    // Cascade rename in categories
    setCategories(prev => {
      const next: Record<string, DBCategory> = {};
      Object.keys(prev).forEach(k => {
        const cat = prev[k];
        if (cat.group === editingGroup.oldName) {
          next[k] = { ...cat, group: cleanNew };
        } else {
          next[k] = cat;
        }
      });
      return next;
    });

    setEditingGroup(prev => ({ ...prev, isOpen: false }));
    useToastStore.getState().addToast(`เปลี่ยนชื่อกลุ่มเป็น "${cleanNew}" สำเร็จ`, 'success');
  };

  const handleDeleteGroup = (groupName: string) => {
    if (groupName === 'อื่นๆ') {
      useToastStore.getState().addToast('ไม่สามารถลบกลุ่ม "อื่นๆ" ได้', 'error');
      return;
    }

    useConfirmStore.getState().showConfirm({
      title: 'ลบกลุ่มเริ่มต้นของระบบ',
      message: `คุณต้องการลบกลุ่ม "${groupName}" หรือไม่? หมวดหมู่ในกลุ่มนี้จะถูกย้ายไปยังกลุ่ม "อื่นๆ"`,
      confirmText: 'ลบกลุ่ม',
      cancelText: 'ยกเลิก',
      isDestructive: true,
      onConfirm: () => {
        // Remove from groups
        setGroups(prev => ({
          ...prev,
          [groupType]: prev[groupType].filter(g => g !== groupName)
        }));

        // Migrate categories to 'อื่นๆ'
        setCategories(prev => {
          const next: Record<string, DBCategory> = {};
          Object.keys(prev).forEach(k => {
            const cat = prev[k];
            if (cat.group === groupName) {
              next[k] = { ...cat, group: 'อื่นๆ' };
            } else {
              next[k] = cat;
            }
          });
          return next;
        });

        useToastStore.getState().addToast(`ลบกลุ่ม "${groupName}" สำเร็จ`, 'success');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-[#0F0720]/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-[#120B24] rounded-[28px] sm:rounded-[36px] shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] flex flex-col animate-slide-up border border-purple-100 dark:border-purple-900/40 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-50/90 via-pink-50/40 to-indigo-50/90 dark:from-purple-950/40 dark:via-[#1A0F33]/60 dark:to-indigo-950/40 border-b border-purple-100/60 dark:border-purple-900/30 z-10">
          <div className="flex items-center gap-3">
            {isAdding ? (
              <button 
                onClick={() => setIsAdding(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-purple-100/80 hover:bg-purple-200 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#2E1065] dark:text-white tracking-tight">
                {isAdding ? (editingKey ? 'แก้ไขหมวดหมู่ระบบ' : 'เพิ่มหมวดหมู่ระบบ') : 'จัดการหมวดหมู่และกลุ่ม (Admin)'}
              </h3>
              <p className="text-[11px] font-bold text-purple-600/70 dark:text-purple-300/70">
                กำหนดค่าเริ่มต้นของระบบสำหรับผู้ใช้ทุกคน
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-2xl bg-purple-100/60 hover:bg-purple-200 dark:bg-white/10 text-purple-700 dark:text-purple-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Segmented Tab Switcher (Categories vs Groups) */}
        {!isAdding && (
          <div className="px-6 pt-3 pb-2 bg-white dark:bg-[#120B24] shrink-0 border-b border-purple-100/60 dark:border-purple-900/30">
            <div className="grid grid-cols-2 p-1.5 bg-purple-50/80 dark:bg-purple-950/30 rounded-2xl border border-purple-100/60 dark:border-purple-900/30">
              <button
                onClick={() => setMainTab('categories')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  mainTab === 'categories'
                    ? 'bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white shadow-md shadow-purple-500/25'
                    : 'text-[#2E1065]/70 dark:text-white/70 hover:text-purple-700 dark:hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                หมวดหมู่เริ่มต้น ({Object.keys(categories).length})
              </button>
              <button
                onClick={() => setMainTab('groups')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  mainTab === 'groups'
                    ? 'bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white shadow-md shadow-purple-500/25'
                    : 'text-[#2E1065]/70 dark:text-white/70 hover:text-purple-700 dark:hover:text-white'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                กลุ่มเริ่มต้น ({groups.expense.length + groups.income.length})
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-white dark:bg-[#120B24] relative">
          
          {isAdding ? (
            /* Category Form (Admin) */
            <div className="bg-gradient-to-br from-[#FAF5FF] to-[#EDE9FE] dark:from-[#1A0F33] dark:to-[#251542] p-5 rounded-3xl shadow-sm border border-purple-200 dark:border-purple-800 animate-fade-in space-y-4">
              <h4 className="font-black text-sm text-[#2E1065] dark:text-white text-center">
                {editingKey ? 'แก้ไขหมวดหมู่ระบบ' : 'เพิ่มหมวดหมู่ระบบใหม่'}
              </h4>
              
              <div>
                <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200 mb-1 block">ชื่อหมวดหมู่</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  className="w-full bg-[#FFF9F2] dark:bg-white/5 rounded-2xl px-4 py-2.5 text-xs font-bold border border-purple-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-purple-400/40 text-[#2E1065] dark:text-white" 
                  placeholder="เช่น ค่าเดินทาง, เงินเดือน" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200 mb-1 block">ประเภทรายการ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTab('lifestyle');
                      if (!groups.expense.includes(newGroup)) {
                        setNewGroup(groups.expense[0] || 'อื่นๆ');
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      newTab !== 'income'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                        : 'bg-white dark:bg-white/5 text-rose-700 border-rose-200'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    รายจ่าย
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTab('income');
                      if (!groups.income.includes(newGroup)) {
                        setNewGroup(groups.income[0] || 'อื่นๆ');
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      newTab === 'income'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                        : 'bg-white dark:bg-white/5 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    รายรับ
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200 mb-1 block">
                  กลุ่มที่สังกัด
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[100px] overflow-y-auto no-scrollbar p-2 bg-white/80 dark:bg-white/5 rounded-2xl border border-purple-100 dark:border-white/10">
                  {currentFormGroups.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setNewGroup(g)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-left truncate ${
                        newGroup === g
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                          : 'bg-purple-50/60 dark:bg-white/5 text-[#2E1065]/70 dark:text-white/70'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200 mb-1.5 block">เลือกสี</label>
                <div className="grid grid-cols-8 gap-2 p-2.5 bg-white/80 dark:bg-white/5 rounded-2xl border border-purple-100 dark:border-white/10">
                  {AVAILABLE_COLORS.map((c: any, idx: number) => {
                    const isSel = newColorIdx === idx;
                    return (
                      <button 
                        key={idx} 
                        onClick={() => setNewColorIdx(idx)}
                        className={`aspect-square rounded-full ${c.solidColor} flex items-center justify-center transition-all ${
                          isSel ? 'scale-115 shadow-md ring-4 ring-purple-400/50 ring-offset-2 ring-offset-white dark:ring-offset-[#120B24]' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200 mb-1.5 block">เลือกไอคอน</label>
                <div className="grid grid-cols-7 gap-1.5 max-h-[120px] overflow-y-auto no-scrollbar p-2 bg-white/80 dark:bg-white/5 rounded-2xl border border-purple-100 dark:border-white/10">
                  {AVAILABLE_ICONS.map(iconName => {
                    const IconComp = getIconComponent(iconName);
                    const isSel = newIcon === iconName;
                    return (
                      <button 
                        key={iconName}
                        onClick={() => setNewIcon(iconName)}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                          isSel 
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md' 
                            : 'bg-white dark:bg-white/5 text-purple-900 dark:text-white hover:bg-purple-100'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                {editingKey && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editingKey);
                      setIsAdding(false);
                    }}
                    className="px-4 py-2.5 rounded-2xl font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition-colors text-xs flex items-center justify-center gap-1 shrink-0 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ลบหมวดหมู่</span>
                  </button>
                )}
                <button onClick={() => setIsAdding(false)} className="flex-1 py-2.5 rounded-2xl font-bold bg-purple-100/80 text-purple-800 hover:bg-purple-200 transition-colors text-xs">ยกเลิก</button>
                <button onClick={handleAdd} disabled={!newName.trim()} className="flex-[2] py-2.5 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 disabled:opacity-50 hover:brightness-105 transition-all text-xs">
                  {editingKey ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่ม'}
                </button>
              </div>
            </div>
          ) : mainTab === 'categories' ? (
            /* Categories Tab (Admin) */
            <div className="space-y-4">
              {/* Category Type Filter & Delete Mode Toggle */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  {[
                    { id: 'expense', label: 'รายจ่าย' },
                    { id: 'income', label: 'รายรับ' },
                    { id: 'all', label: 'ทั้งหมด' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setFilterTab(t.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        filterTab === t.id 
                          ? 'bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white shadow-md' 
                          : 'bg-purple-50/70 dark:bg-white/10 text-[#2E1065]/70 dark:text-white/70'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Quick Delete Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsManageMode(!isManageMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 border shadow-sm ${
                    isManageMode
                      ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/30'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 hover:bg-rose-100'
                  }`}
                  title="เปิด/ปิด โหมดลบหมวดหมู่ด่วน"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isManageMode ? 'เสร็จสิ้น' : 'โหมดลบ'}</span>
                </button>
              </div>

              {/* Grouped Category Cards */}
              <div className="space-y-4">
                {Object.entries(groupedAll).map(([group, cats]) => {
                  if (cats.length === 0) return null;
                  return (
                    <div key={group} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <h3 className="text-xs font-black text-[#2E1065] dark:text-purple-200 uppercase">{group}</h3>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.2 rounded-md">
                          {cats.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                        {cats.map((cat) => {
                          const { icon: Icon, color, textColor } = getCategoryStyle(cat, categories);
                          return (
                            <div key={cat} className="flex flex-col items-center gap-1 group relative">
                              <div 
                                onClick={() => openEdit(cat)}
                                className={`w-14 h-14 rounded-[22px] flex items-center justify-center shadow-sm border relative ${color} ${textColor} cursor-pointer hover:scale-105 active:scale-95 transition-all`}
                              >
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(cat);
                                  }}
                                  className={`absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center transition-all z-20 shadow-md ${
                                    isManageMode
                                      ? 'w-6 h-6 bg-rose-500 text-white border-2 border-white dark:border-slate-900 scale-110 opacity-100 animate-pulse cursor-pointer'
                                      : 'w-5 h-5 bg-white dark:bg-slate-800 text-rose-500 border border-slate-200 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-rose-500 hover:text-white'
                                  }`}
                                  title="ลบหมวดหมู่นี้"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <Icon className="w-6 h-6" strokeWidth={2.2} />
                              </div>
                              <div className="w-full text-center px-0.5 mt-0.5">
                                <AutoShrinkText 
                                  origin="center" 
                                  className="text-[11px] font-bold text-[#2E1065]/80 dark:text-white/80" 
                                  text={cat} 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Groups Tab (Admin) */
            <div className="space-y-4">
              {/* Group Type Switcher */}
              <div className="grid grid-cols-2 p-1.5 bg-purple-50/80 dark:bg-purple-950/30 rounded-2xl border border-purple-100/60 dark:border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setGroupType('expense')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    groupType === 'expense'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                      : 'text-[#2E1065]/70 dark:text-white/70'
                  }`}
                >
                  กลุ่มรายจ่ายเริ่มต้น ({groups.expense.length})
                </button>
                <button
                  type="button"
                  onClick={() => setGroupType('income')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    groupType === 'income'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                      : 'text-[#2E1065]/70 dark:text-white/70'
                  }`}
                >
                  กลุ่มรายรับเริ่มต้น ({groups.income.length})
                </button>
              </div>

              {/* Add New Default Group Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                  placeholder={`ระบุชื่อกลุ่มเริ่มต้น${groupType === 'income' ? 'รายรับ' : 'รายจ่าย'}ใหม่...`}
                  className="flex-1 bg-[#FFF9F2] dark:bg-white/5 border border-purple-100 dark:border-white/10 rounded-2xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-400/40 text-[#2E1065] dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddGroup}
                  disabled={!newGroupName.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-bold disabled:opacity-50 shadow-md shadow-purple-500/20 flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มกลุ่ม
                </button>
              </div>

              {/* Groups List */}
              <div className="space-y-2.5">
                {(groupType === 'income' ? groups.income : groups.expense).map(g => {
                  const count = groupCounts[g] || 0;
                  const isProtected = g === 'อื่นๆ';

                  return (
                    <div 
                      key={g}
                      className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-white/5 border border-purple-100/80 dark:border-purple-900/40 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                          <FolderTree className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <AutoShrinkText origin="left" className="text-xs font-bold text-[#2E1065] dark:text-white" text={g} />
                          <span className="text-[10px] font-bold text-purple-600/70 dark:text-purple-300/70 block">
                            {count} หมวดหมู่
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isProtected && (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingGroup({ isOpen: true, oldName: g, newName: g, type: groupType })}
                              className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 text-purple-700 hover:text-purple-900 border border-purple-100 flex items-center justify-center shadow-sm"
                              title="แก้ไขชื่อกลุ่ม"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGroup(g)}
                              className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 text-rose-500 hover:text-rose-700 border border-rose-100 flex items-center justify-center shadow-sm"
                              title="ลบกลุ่ม"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
        
        {/* Actions Bar */}
        <div className="p-4 bg-white dark:bg-[#120B24] shrink-0 border-t border-purple-100/60 dark:border-purple-900/30 flex gap-2.5 z-10">
          {!isAdding && (
            <button 
              onClick={openAdd} 
              className="w-12 h-12 shrink-0 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center hover:bg-purple-200 transition-colors shadow-sm"
              title="เพิ่มหมวดหมู่ใหม่"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={handleSave} 
            disabled={saving || isAdding} 
            className="flex-1 py-3 rounded-2xl font-black bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:brightness-105 text-white shadow-lg shadow-purple-500/30 disabled:opacity-50 transition-all active:scale-98 text-sm flex items-center justify-center gap-2"
          >
            {saving ? 'กำลังบันทึกข้อมูลระบบ...' : 'บันทึกข้อมูลระบบ (Admin)'}
          </button>
        </div>

      </div>

      {/* Admin Rename Group Sub-Modal */}
      {editingGroup.isOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="absolute inset-0 bg-[#0F0720]/75 backdrop-blur-md"
            onClick={() => setEditingGroup(prev => ({ ...prev, isOpen: false }))}
          />
          <div className="relative bg-white dark:bg-[#120B24] rounded-[32px] shadow-2xl w-full max-w-sm border border-purple-100 dark:border-purple-900/40 p-6 z-10 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#2E1065] dark:text-white">แก้ไขชื่อกลุ่มระบบ</h3>
                  <p className="text-[11px] font-bold text-purple-600/70">กลุ่ม{editingGroup.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingGroup(prev => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-xl bg-purple-100/60 text-purple-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200 mb-1.5 block">
                ชื่อกลุ่มเดิม: <span className="text-purple-700 dark:text-purple-300 font-black">{editingGroup.oldName}</span>
              </label>
              <input
                type="text"
                autoFocus
                value={editingGroup.newName}
                onChange={(e) => setEditingGroup(prev => ({ ...prev, newName: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveRenameGroup()}
                placeholder="ระบุชื่อกลุ่มใหม่..."
                className="w-full bg-[#FFF9F2] dark:bg-white/5 rounded-2xl px-4 py-2.5 text-xs font-bold border border-purple-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-purple-400/40 text-[#2E1065] dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingGroup(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 rounded-2xl font-bold text-xs bg-purple-100/70 text-purple-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveRenameGroup}
                disabled={!editingGroup.newName.trim()}
                className="flex-[2] py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white shadow-md disabled:opacity-50"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export function AdminAiModal({ isOpen, onClose }: ModalProps) {
  const [apiKeys, setApiKeys] = useState<string[]>(['']);
  const [isEditingKeys, setIsEditingKeys] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchKeys = async () => {
        const keys = await getApiKeys();
        if (keys.length > 0) {
          setApiKeys(keys);
        } else {
          setApiKeys(['']); 
        }
      };
      fetchKeys();
    } else {
      setIsEditingKeys(false);
    }
  }, [isOpen]);

  const handleSaveKeys = async () => {
    setLoadingKeys(true);
    try {
      const validKeys = apiKeys.filter(k => k.trim() !== '');
      await saveApiKeysToDb(validKeys);
      setApiKeys(validKeys.length > 0 ? validKeys : ['']);
      setIsEditingKeys(false);
    } catch (e) {
      alert('Failed to save API keys');
    } finally {
      setLoadingKeys(false);
    }
  };

  const addKeyField = () => setApiKeys([...apiKeys, '']);
  const removeKeyField = (index: number) => setApiKeys(apiKeys.filter((_, i) => i !== index));
  const updateKeyField = (index: number, val: string) => {
    const newKeys = [...apiKeys];
    newKeys[index] = val;
    setApiKeys(newKeys);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-2xl w-full max-w-md animate-slide-up flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <SettingsIcon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>ตั้งค่าระบบ AI</h3>
              <p className="text-xs text-purple-500 font-semibold">เฉพาะผู้ดูแลระบบ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar pb-4 flex-1">
          <div className="space-y-3">
            {apiKeys.map((key, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <div className="relative flex-1">
                  <input 
                    type="password" 
                    value={key}
                    onChange={(e) => updateKeyField(index, e.target.value)}
                    disabled={!isEditingKeys}
                    placeholder="gsk_..."
                    className={`w-full rounded-2xl px-4 py-3.5 text-sm font-bold transition-all outline-none border ${
                      isEditingKeys 
                        ? 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-900/50 focus:ring-2 focus:ring-purple-500/30 shadow-inner' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-80'
                    }`}
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
                {isEditingKeys && (
                  <button 
                    onClick={() => removeKeyField(index)}
                    className="w-[50px] h-[50px] rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors shrink-0 shadow-sm border border-red-100"
                  >
                    <Trash2 size={20} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
            
            {isEditingKeys && (
              <button 
                onClick={addKeyField}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors mt-2"
              >
                <Plus size={18} strokeWidth={3} /> เพิ่ม API Key
              </button>
            )}
            
            <div className="mt-4 flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-2xl border border-purple-100 dark:border-purple-800/50">
              <Info size={16} className="text-purple-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 leading-relaxed">
                * เพิ่มกี่อันก็ได้! ระบบจะสลับ API Key วนลูปให้อัตโนมัติเมื่อโควต้าเต็ม (Unlimited Usage)
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3 shrink-0">
          {isEditingKeys ? (
            <button 
              onClick={handleSaveKeys} 
              disabled={loadingKeys}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 active:scale-95 flex justify-center items-center gap-2"
            >
              <CheckCircle2 size={18} /> {loadingKeys ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          ) : (
            <button 
              onClick={() => setIsEditingKeys(true)} 
              className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95 flex justify-center items-center gap-2" 
            >
              แก้ไข API Keys
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { get } from 'firebase/database';
export function AdminUsersModal({ isOpen, onClose }: ModalProps) {
  const [usersList, setUsersList] = useState<{uid: string, name: string, email: string, photo: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      get(ref(db, 'users')).then(snapshot => {
        if (snapshot.exists()) {
          const usersObj = snapshot.val();
          const list = Object.keys(usersObj).map(uid => {
            const profile = usersObj[uid]?.profile || {};
            return {
              uid,
              name: profile.displayName || `User (${uid.substring(0, 6)}...)`,
              email: profile.email || 'ยังไม่มีข้อมูล (รอผู้ใช้เข้าสู่ระบบใหม่)',
              photo: profile.photoURL || ''
            };
          });
          setUsersList(list);
        } else {
          setUsersList([]);
        }
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-2xl w-full max-w-md animate-slide-up flex flex-col max-h-[85vh]">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-blue-500/10 flex items-center justify-center">
              <Users size={20} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>ผู้ใช้งานทั้งหมด</h3>
              <p className="text-xs text-blue-500 font-semibold">{usersList.length} บัญชีในระบบ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        {loading ? (
          <p className="text-sm text-slate-500 py-10 text-center">กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="overflow-y-auto no-scrollbar flex-1 -mx-2 px-2 mb-4">
            <div className="space-y-3">
              {usersList.map((u) => (
                <div key={u.uid} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                    {u.photo ? (
                      <img 
                        src={u.photo} 
                        alt={u.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200 truncate">{u.name}</div>
                    <div className="text-[12px] text-slate-500 truncate">{u.email}</div>
                  </div>
                </div>
              ))}
              {usersList.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">ไม่พบผู้ใช้งาน</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
