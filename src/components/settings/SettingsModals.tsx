import { useState, useRef, useEffect, useMemo } from 'react';
import { X, CheckCircle2, Upload, Download, Type, User, Tag, Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAppStore } from '@/store/useAppStore';
import { useThemeStore, type AppFont } from '@/store/useThemeStore';
import { fetchCategories } from '@/services/transactionService';
import { APP_VERSION } from '@/lib/constants';
import { getCategoryStyle, getAllCategoriesGrouped, AVAILABLE_ICONS, AVAILABLE_COLORS, getIconComponent, CATEGORY_SEED, type DBCategory, type CategoryTab } from '@/utils/categoryStyles';
import CustomSelect from '@/components/ui/CustomSelect';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Edit Profile Modal
export function EditProfileModal({ isOpen, onClose }: ModalProps) {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.displayName || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);

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
      onClose();
    } catch (e) {
      alert("Failed to update profile");
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
          <h3 className="text-2xl font-black mb-1 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">แก้ไขโปรไฟล์</h3>
          <p className="text-xs text-slate-500 font-medium">ปรับแต่งข้อมูลส่วนตัวของคุณ</p>
        </div>
        
        {/* Avatar Preview */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 shadow-inner flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl mb-3">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
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
            <label className="text-[11px] font-black uppercase tracking-wider mb-2 block text-slate-400 ml-1">ชื่อแสดงผล</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 outline-none border border-slate-200 dark:border-slate-700/50 transition-all"
              placeholder="กรอกชื่อของคุณ"
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider mb-2 block text-slate-400 ml-1">รูปโปรไฟล์ (URL)</label>
            <input 
              type="text" 
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 outline-none border border-slate-200 dark:border-slate-700/50 transition-all"
              placeholder="https://..."
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            ยกเลิก
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-[1.5] py-3.5 rounded-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 disabled:opacity-50 hover:shadow-purple-500/50 transition-all active:scale-95">
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Font Selection Modal
export function FontSelectModal({ isOpen, onClose }: ModalProps) {
  const { font, setFont } = useThemeStore();
  const fonts: AppFont[] = ['Noto Sans Thai', 'Prompt', 'Sarabun'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-2xl w-full max-w-[320px] animate-slide-up">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>เลือกฟอนต์แอป</h3>
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
        <button onClick={onClose} className="w-full py-3 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">ปิด</button>
      </div>
    </div>
  );
}

// 3. About Modal
export function AboutModal({ isOpen, onClose }: ModalProps) {
  const appName = useAppStore(s => s.appName);
  const appIconName = useAppStore(s => s.appIcon);
  const AppIcon = getIconComponent(appIconName);
  
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-[320px] animate-slide-up text-center">
        <div className="w-20 h-20 mx-auto rounded-[1.5rem] bg-gradient-to-tr from-[#A855F7] to-[#8B5CF6] shadow-xl flex items-center justify-center mb-5 border-[4px] border-white dark:border-slate-800 overflow-hidden">
          {appIconName.startsWith('http') ? (
            <img src={appIconName} alt="App Icon" className="w-full h-full object-cover" />
          ) : (
            <AppIcon className="w-10 h-10 text-white" />
          )}
        </div>
        <h3 className="text-2xl font-black mb-1 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{appName}</h3>
        <p className="text-sm font-bold text-slate-500 mb-6">เวอร์ชัน {APP_VERSION}</p>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
          แอปพลิเคชันจัดการการเงินระดับมืออาชีพ ที่ผสานเทคโนโลยี AI เพื่อสแกนและวิเคราะห์สลิปธนาคารอัตโนมัติ ช่วยให้การจดบันทึกรายรับรายจ่ายเป็นเรื่องง่ายและแม่นยำ
        </p>
        
        <button onClick={onClose} className="w-full py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          ตกลง
        </button>
      </div>
    </div>
  );
}

// 4. Export / Import Data Modal
export function ExportImportModal({ isOpen, onClose }: ModalProps) {
  const { transactions } = useTransactionStore();

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'paysave_transactions.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const header = Object.keys(transactions[0]).join(',');
    const rows = transactions.map(t => Object.values(t).map(v => `"${v}"`).join(','));
    const csvStr = [header, ...rows].join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'paysave_transactions.csv');
    linkElement.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-2xl w-full max-w-[320px] animate-slide-up">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>จัดการข้อมูล</h3>
        
        <div className="space-y-3 mb-6">
          <button onClick={handleExportJSON} className="w-full py-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">ส่งออกเป็น JSON</span>
          </button>
          
          <button onClick={handleExportCSV} className="w-full py-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-6 h-6 text-green-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">ส่งออกเป็น CSV</span>
          </button>
        </div>
        
        <button onClick={onClose} className="w-full py-3 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">ปิด</button>
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
      
      onClose();
    } catch (e) {
      alert("Failed to save app info");
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

// 6. Admin Category Modal
export function AdminCategoryModal({ isOpen, onClose }: ModalProps) {
  const appCategories = useAppStore(s => s.appCategories);
  const [categories, setCategories] = useState<Record<string, DBCategory>>({});
  const [saving, setSaving] = useState(false);
  
  // Add state
  const [isAdding, setIsAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<CategoryTab | 'all'>('expense');
  const [newName, setNewName] = useState('');
  const [newTab, setNewTab] = useState<CategoryTab>('lifestyle');
  const [newGroup, setNewGroup] = useState('ไลฟ์สไตล์');
  const [newIcon, setNewIcon] = useState('Tag');
  const [newColorIdx, setNewColorIdx] = useState(0);

  const getGroupOptions = (tab: string) => {
    if (tab === 'income') return ['รายรับ', 'โบนัส', 'ดอกเบี้ย', 'เงินลงทุน', 'อื่นๆ'];
    return ['ไลฟ์สไตล์', 'ค่าใช้จ่ายประจำ', 'สุขภาพ', 'การเดินทาง', 'บิลต่างๆ', 'บ้าน', 'รถ', 'อื่นๆ'];
  };

  // Update group when tab changes
  useEffect(() => {
    const opts = getGroupOptions(newTab);
    if (!opts.includes(newGroup)) {
      setNewGroup(opts[0]);
    }
  }, [newTab]);

  useEffect(() => {
    if (isOpen) {
      if (appCategories && Object.keys(appCategories).length > 0) {
        setCategories({ ...appCategories });
      } else {
        setCategories({ ...CATEGORY_SEED });
      }
    }
  }, [isOpen, appCategories]);

  const filteredCategories = useMemo(() => {
    if (filterTab === 'all') return categories;
    const filtered: Record<string, DBCategory> = {};
    Object.keys(categories).forEach(k => {
      const catTab = categories[k].tab;
      if (filterTab === 'expense' && (catTab === 'expense' || catTab === 'lifestyle' || catTab === 'fixed' || catTab === 'savings')) {
        filtered[k] = categories[k];
      } else if (catTab === filterTab) {
        filtered[k] = categories[k];
      }
    });
    return filtered;
  }, [categories, filterTab]);

  const groupedAll = useMemo(() => {
    return getAllCategoriesGrouped(Object.keys(filteredCategories), filteredCategories);
  }, [filteredCategories]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await set(ref(db, 'app_categories'), categories);
      useAppStore.getState().setAppCategories(categories);
      onClose();
    } catch (e) {
      alert("Failed to save categories");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const colorObj = AVAILABLE_COLORS[newColorIdx];
    const newCatObj: DBCategory = {
      iconName: newIcon,
      color: colorObj.color + ' border-white/50',
      textColor: colorObj.textColor,
      tab: newTab,
      group: newGroup
    };
    
    setCategories(prev => {
      const next = { ...prev };
      if (editingKey && editingKey !== newName.trim()) {
        delete next[editingKey];
      }
      next[newName.trim()] = newCatObj;
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
    setNewTab(filterTab as any);
    setNewGroup('ไลฟ์สไตล์');
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
    if (!confirm(`ต้องการลบหมวดหมู่ "${catName}" หรือไม่?`)) return;
    setCategories(prev => {
      const next = { ...prev };
      delete next[catName];
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#F8FAFC] dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md mx-auto max-h-[90vh] flex flex-col animate-slide-up border border-white/50 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0 bg-white dark:bg-slate-800 rounded-t-[2.5rem] shadow-sm z-10">
          <div className="flex items-center gap-3">
            {isAdding && (
              <button 
                onClick={() => setIsAdding(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            )}
            <div>
              <h3 className="text-xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">จัดการหมวดหมู่</h3>
              <p className="text-xs font-bold text-slate-400">Admin Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tab Filter */}
        {!isAdding && (
          <div className="px-6 pb-2 bg-white dark:bg-slate-800 shrink-0 z-10 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {[
                { id: 'income', label: 'รายรับ' },
                { id: 'expense', label: 'รายจ่าย' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilterTab(t.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    filterTab === t.id 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-[#F8FAFC] dark:bg-slate-900 relative">
          
          {isAdding ? (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in mb-6">
              <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4 text-center">
                {editingKey ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">ชื่อหมวดหมู่</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-orange-500/50" placeholder="เช่น ค่าซ่อมรถ" />
                </div>
                
                <div className="flex flex-col gap-4">
                  <CustomSelect
                    label={`กลุ่ม (Group) - ของ${newTab === 'income' ? 'รายรับ' : 'รายจ่าย'}`}
                    value={newGroup}
                    onChange={setNewGroup}
                    options={getGroupOptions(newTab).map(g => ({ label: g, value: g }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">เลือกสี</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLORS.map((c: any, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => setNewColorIdx(idx)}
                        className={`w-8 h-8 rounded-full ${c.solidColor} flex items-center justify-center transition-all ${newColorIdx === idx ? 'scale-125 shadow-lg border-2 border-white dark:border-slate-900 ring-2 ring-slate-200 dark:ring-slate-700 z-10' : 'opacity-50 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">เลือกไอคอน</label>
                  <div className="grid grid-cols-6 gap-2 max-h-[120px] overflow-y-auto no-scrollbar p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    {AVAILABLE_ICONS.map(iconName => {
                      const IconComp = getIconComponent(iconName);
                      return (
                        <button 
                          key={iconName}
                          onClick={() => setNewIcon(iconName)}
                          className={`aspect-square rounded-xl flex items-center justify-center transition-all ${newIcon === iconName ? 'bg-orange-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-orange-100'}`}
                        >
                          <IconComp size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-5">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-3 rounded-xl font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">ยกเลิก</button>
                <button onClick={handleAdd} disabled={!newName.trim()} className="flex-[2] py-3 rounded-xl font-bold bg-orange-500 text-white shadow-lg shadow-orange-500/30 disabled:opacity-50 hover:bg-orange-600 transition-colors">
                  {editingKey ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่ม'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {Object.entries(groupedAll).map(([group, cats]) => {
                if (cats.length === 0) return null;
                return (
                  <div key={group} className="mb-6">
                    <h3 className="text-sm font-bold text-slate-500 mb-3 ml-2">{group}</h3>
                    <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                      {cats.map((cat) => {
                        const { icon: Icon, color, textColor } = getCategoryStyle(cat, categories);
                        return (
                          <div key={cat} className="flex flex-col items-center gap-2 group relative">
                            <div 
                              onClick={() => openEdit(cat)}
                              className={`w-14 h-14 rounded-[20px] flex items-center justify-center shadow-sm border relative ${color} ${textColor} cursor-pointer hover:shadow-md hover:scale-105 transition-all`}
                            >
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(cat);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-white z-10 hover:bg-red-500 hover:text-white"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                              <Icon className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 text-center break-words max-w-full px-1">
                              {cat}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}

        </div>
        
        {/* Actions */}
        <div className="p-5 bg-white dark:bg-slate-800 shrink-0 border-t border-slate-100 dark:border-slate-700 flex gap-3 z-10">
          {!isAdding && (
            <button 
              onClick={openAdd} 
              className="w-14 h-14 shrink-0 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center hover:bg-orange-200 transition-colors"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          )}
          <button 
            onClick={handleSave} 
            disabled={saving || isAdding} 
            className="flex-1 py-4 rounded-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 disabled:opacity-50 transition-transform active:scale-95 text-lg"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>

      </div>
    </div>
  );
}
