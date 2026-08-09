import {
  User,
  Palette,
  Bell,
  Tag,
  Download,
  Shield,
  Info,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Settings as SettingsIcon,
  CheckCircle2,
  Type,
  Plus,
  Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { useAppStore } from '@/store/useAppStore';
import { getApiKeys, setApiKeys as saveApiKeysToDb } from '@/services/transactionService';
import { APP_VERSION } from '@/lib/constants';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { EditProfileModal, FontSelectModal, AboutModal, ExportImportModal, AdminAppInfoModal, AdminCategoryModal } from './SettingsModals';

type ModalType = 'none' | 'profile' | 'font' | 'about' | 'export' | 'adminApp' | 'adminCategory';

interface SettingItem {
  icon: typeof User;
  label: string;
  sublabel?: string;
  action?: 'toggle-theme' | 'navigate' | ModalType;
  iconColor: string;
  iconBg: string;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

export default function SettingsView() {
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useTranslation();
  const user = auth.currentUser;

  
  const SETTING_GROUPS: SettingGroup[] = [
    {
      title: t('settings.account', 'บัญชีผู้ใช้'),
      items: [
        {
          icon: User,
          label: t('settings.editProfile', 'แก้ไขโปรไฟล์'),
          sublabel: t('settings.profileDesc', 'ชื่อ, รูปภาพ'),
          action: 'profile',
          iconColor: '#3b82f6',
          iconBg: '#3b82f618',
        },
      ],
    },
    {
      title: t('settings.customize', 'ปรับแต่ง'),
      items: [
        {
          icon: Palette,
          label: t('settings.theme', 'ธีม'),
          sublabel: t('settings.themeDesc', 'สลับ Dark / Light Mode'),
          action: 'toggle-theme',
          iconColor: '#8b5cf6',
          iconBg: '#8b5cf618',
        },
      ],
    },
    {
      title: t('settings.info', 'ข้อมูล'),
      items: [
        {
          icon: Download,
          label: t('settings.exportImport', 'ส่งออก / นำเข้าข้อมูล'),
          sublabel: t('settings.exportImportDesc', 'CSV, JSON'),
          action: 'export',
          iconColor: '#06b6d4',
          iconBg: '#06b6d418',
        },
        {
          icon: Info,
          label: t('settings.about', 'เกี่ยวกับแอป'),
          sublabel: `${useAppStore.getState().appName} v${APP_VERSION}`,
          action: 'about',
          iconColor: '#64748b',
          iconBg: '#64748b18',
        },
      ],
    },
  ];

  const [apiKeys, setApiKeys] = useState<string[]>(['']);
  const [isEditingKeys, setIsEditingKeys] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const setSettingsModalOpen = useAppStore(s => s.setSettingsModalOpen);
  
  // Stealth Admin Access
  const [tapCount, setTapCount] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);

  // Sync modal state to global store to hide BottomNav
  useEffect(() => {
    setSettingsModalOpen(activeModal !== 'none' || showPinModal);
    return () => setSettingsModalOpen(false);
  }, [activeModal, showPinModal, setSettingsModalOpen]);

  // Fetch keys when admin is unlocked
  useEffect(() => {
    if (isAdminUnlocked) {
      const fetchKeys = async () => {
        const keys = await getApiKeys();
        if (keys.length > 0) {
          setApiKeys(keys);
        } else {
          setApiKeys(['']); // at least one empty slot
        }
      };
      fetchKeys();
    }
  }, [isAdminUnlocked]);

  const handleAvatarTap = () => {
    if (isAdminUnlocked) return;
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount === 5) {
      setShowPinModal(true);
      setTapCount(0); // reset
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

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

  return (
    <div className="stagger-children">
      {/* Profile card - Tap 5 times to reveal admin */}
      <div className="px-5 mb-8">
        <div 
          className="bg-gradient-to-tr from-[#A855F7]/10 to-[#3B82F6]/10 dark:bg-white/30 dark:from-[#A855F7]/30 dark:to-[#3B82F6]/30 backdrop-blur-xl border border-white/50 dark:border-white/20 rounded-[32px] shadow-sm p-6 flex items-center gap-5 transition-transform active:scale-95 cursor-pointer relative overflow-hidden"
          onClick={handleAvatarTap}
        >
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl font-black shadow-[0_8px_24px_rgba(139,92,246,0.25)] border-[3px] border-white dark:border-slate-800 relative overflow-hidden shrink-0"
            style={{ background: 'var(--gradient-hero)', color: 'white' }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 bg-white/20" />
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'M'}
              </>
            )}
          </div>
          <div className="flex-1 min-w-0 z-10">
            <h2 className="text-xl font-bold tracking-tight mb-1 text-[#2E1065] dark:text-white truncate">
              {user?.displayName || 'ผู้ใช้งาน'}
            </h2>
            <p className="text-sm font-medium opacity-70 mb-2.5 text-[#2E1065] dark:text-white/70 truncate">
              {user?.email || 'user@example.com'}
            </p>
            <span
              className="inline-flex items-center px-3 py-1.5 text-[11px] font-black rounded-xl uppercase tracking-widest shadow-sm"
              style={{
                background: 'var(--gradient-hero)',
                color: 'white',
              }}
            >
              Pro Member
            </span>
          </div>
        </div>
      </div>

      {/* Setting groups */}
      {SETTING_GROUPS.map((group) => (
        <div key={group.title} className="px-5 mb-5">
          <p
            className="text-xs font-semibold mb-2 px-1 uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            {group.title}
          </p>
          <div className="bg-white/40 dark:bg-white/30 backdrop-blur-xl border border-white/50 dark:border-white/20 rounded-[24px] shadow-sm overflow-hidden">
            {group.items.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 px-4 py-3 border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 active:bg-white/30 transition-colors cursor-pointer"
                onClick={() => {
                  if (item.action === 'toggle-theme') toggleTheme();
                  else if (item.action && item.action !== 'navigate') {
                    setActiveModal(item.action as ModalType);
                  }
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.iconBg }}
                >
                  <item.icon size={18} style={{ color: item.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.label}
                  </p>
                  {item.sublabel && (
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {item.sublabel}
                    </p>
                  )}
                </div>

                {item.action === 'toggle-theme' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTheme();
                    }}
                    className="relative w-12 h-7 rounded-full transition-colors duration-300"
                    style={{
                      background:
                        theme === 'dark'
                          ? 'var(--color-primary)'
                          : 'var(--skeleton-base)',
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300"
                      style={{
                        background: 'white',
                        transform:
                          theme === 'dark'
                            ? 'translateX(22px)'
                            : 'translateX(2px)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      }}
                    >
                      {theme === 'dark' ? (
                        <Moon size={12} color="#0d9488" />
                      ) : (
                        <Sun size={12} color="#f59e0b" />
                      )}
                    </div>
                  </button>
                ) : (
                  <ChevronRight
                    size={18}
                    style={{ color: 'var(--text-muted)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Admin Settings: AI Keys & Management (Stealth Mode) */}
      {isAdminUnlocked && (
        <div className="px-5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
          
          {/* AI Settings Card */}
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="flex items-start justify-between mb-6 mt-2">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <SettingsIcon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>ตั้งค่าระบบ AI</h3>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-500">เฉพาะผู้ดูแลระบบ</p>
                </div>
              </div>
              
              {isEditingKeys ? (
                <button 
                  onClick={handleSaveKeys} 
                  disabled={loadingKeys}
                  className="flex items-center gap-1.5 text-[11px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 active:scale-95"
                >
                  <CheckCircle2 size={14} /> {loadingKeys ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditingKeys(true)} 
                  className="flex items-center gap-1.5 text-[11px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95" 
                >
                  แก้ไข
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {apiKeys.map((key, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <div className="relative flex-1">
                    <input 
                      type="password" 
                      value={key}
                      onChange={(e) => updateKeyField(index, e.target.value)}
                      disabled={!isEditingKeys}
                      placeholder="AIzaSy..."
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

          {/* Management Menu Card */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-[13px] font-bold text-[#2E1065]/50 dark:text-white/50 mb-3 px-2">
            {t('settings.adminMode', 'โหมดผู้ดูแลระบบ (Admin)')}
          </h3>
          <div className="bg-white/40 dark:bg-white/30 backdrop-blur-md rounded-[28px] overflow-hidden border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.05)]">
            <button
              onClick={() => setActiveModal('adminApp')}
              className="w-full p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/60 dark:active:bg-white/10 transition-colors border-b border-[#2E1065]/5 dark:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <SettingsIcon className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[#2E1065] dark:text-white text-[15px]">{t('settings.appInfo', 'ตั้งค่าแอปพลิเคชัน')}</div>
                  <div className="text-[12px] font-medium text-[#2E1065]/50 dark:text-white/50">ชื่อ, โลโก้, สีธีม</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2E1065]/30 dark:text-white/30" />
            </button>
            
            <button
              onClick={() => setActiveModal('adminCategory')}
              className="w-full p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/60 dark:active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-rose-500/10 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[#2E1065] dark:text-white text-[15px]">{t('settings.manageCategories', 'จัดการหมวดหมู่')}</div>
                  <div className="text-[12px] font-medium text-[#2E1065]/50 dark:text-white/50">เพิ่ม/แก้ไข หมวดหมู่รายการ</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2E1065]/30 dark:text-white/30" />
            </button>
          </div>
        </div>

        </div>
      )}

      {/* Stealth PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setShowPinModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-2xl w-full max-w-[280px] border border-white/20 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-purple-500" />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Developer Mode</h3>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Enter PIN to unlock</p>
            
            <input 
              type="password" 
              autoFocus
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                if (e.target.value.length === 6) {
                  // auto submit when 6 digits
                  setTimeout(() => {
                    if (e.target.value === '465784') {
                      setIsAdminUnlocked(true);
                      setShowPinModal(false);
                      setPinInput('');
                    } else {
                      alert('Invalid PIN!');
                      setPinInput('');
                      setShowPinModal(false);
                    }
                  }, 100);
                }
              }}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-center tracking-[0.5em] text-lg font-bold outline-none focus:ring-2 focus:ring-purple-500/50 mb-2"
              placeholder="••••••"
              maxLength={6}
            />
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-5 mb-8">
        <button 
          onClick={handleLogout}
          className="w-full py-4 rounded-3xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 mb-10 shadow-sm border border-red-100 dark:border-red-500/20 animate-slide-up"
          style={{ animationDelay: '400ms' }}
        >
          <LogOut className="w-5 h-5" />
          {t('settings.logout', 'ออกจากระบบ')}
        </button>
      </div>
      <EditProfileModal isOpen={activeModal === 'profile'} onClose={() => setActiveModal('none')} />
      <FontSelectModal isOpen={activeModal === 'font'} onClose={() => setActiveModal('none')} />
      <AboutModal isOpen={activeModal === 'about'} onClose={() => setActiveModal('none')} />
      <ExportImportModal isOpen={activeModal === 'export'} onClose={() => setActiveModal('none')} />
      <AdminAppInfoModal isOpen={activeModal === 'adminApp'} onClose={() => setActiveModal('none')} />
      <AdminCategoryModal isOpen={activeModal === 'adminCategory'} onClose={() => setActiveModal('none')} />
    </div>
  );
}
