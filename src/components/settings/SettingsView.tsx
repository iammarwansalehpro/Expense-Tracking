import {
  User,
  Palette,
  Bell,
  Tag,
  Download,
  Shield,
  ShieldCheck,
  Info,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Settings as SettingsIcon,
  CheckCircle2,
  Type,
  Plus,
  Trash2,
  Crown,
  Users,
  Globe
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getApiKeys, setApiKeys as saveApiKeysToDb } from '@/services/transactionService';
import { APP_VERSION } from '@/lib/constants';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumThemeSwitch from '@/components/ui/PremiumThemeSwitch';
import PremiumLanguageSwitch from '@/components/ui/PremiumLanguageSwitch';
import { EditProfileModal, FontSelectModal, AboutModal, PrivacyPolicyModal, ExportImportModal, AdminAppInfoModal, AdminCategoryModal, AdminAiModal, AdminUsersModal } from './SettingsModals';
import UserCategoryManagerModal from './UserCategoryManagerModal';

type ModalType = 'none' | 'profile' | 'font' | 'about' | 'privacy' | 'export' | 'categories' | 'adminApp' | 'adminCategory' | 'adminAi' | 'adminUsers';

interface SettingItem {
  icon: typeof User;
  label: string;
  sublabel?: string;
  action?: 'toggle-theme' | 'toggle-language' | 'navigate' | ModalType;
  iconColor: string;
  iconBg: string;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

export default function SettingsView() {
  const { theme, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();
  const user = auth.currentUser;

  
  const SETTING_GROUPS: SettingGroup[] = [
    {
      title: t('settings.account', 'บัญชีผู้ใช้'),
      items: [
        {
          icon: User,
          label: t('settings.editProfile', 'แก้ไขโปรไฟล์'),
          sublabel: t('settings.profileDesc', 'ชื่อผู้ใช้งาน'),
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
          icon: Tag,
          label: t('settings.manageCategories', 'จัดการหมวดหมู่และกลุ่ม'),
          sublabel: t('settings.categoriesDesc', 'กำหนดหมวดหมู่รายรับ-รายจ่ายของคุณ'),
          action: 'categories',
          iconColor: '#ec4899',
          iconBg: '#ec489918',
        },
        {
          icon: Palette,
          label: t('settings.theme', 'ธีม'),
          sublabel: t('settings.themeDesc', 'สลับ Dark / Light Mode'),
          action: 'toggle-theme',
          iconColor: '#8b5cf6',
          iconBg: '#8b5cf618',
        },
        {
          icon: Globe,
          label: t('settings.language', 'ภาษา'),
          sublabel: language === 'th' ? 'ภาษาไทย (TH)' : 'English (EN)',
          action: 'toggle-language',
          iconColor: '#3b82f6',
          iconBg: '#3b82f618',
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
        {
          icon: ShieldCheck,
          label: t('settings.privacy', 'นโยบายความเป็นส่วนตัว'),
          sublabel: t('settings.privacyDesc', 'ความปลอดภัยและการปกป้องข้อมูล'),
          action: 'privacy',
          iconColor: '#10b981',
          iconBg: '#10b98118',
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

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.photoURL]);

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
            {user?.photoURL && !imgError ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Profile'} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 rounded-full shadow-[0_4px_12px_rgba(251,191,36,0.25)] border border-white/60 dark:border-white/20">
              <Crown className="w-3.5 h-3.5 text-amber-950 drop-shadow-sm" />
              <span className="text-[10px] font-black text-amber-950 uppercase tracking-[0.2em] pt-[1px] drop-shadow-sm">
                Pro Member
              </span>
            </div>
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
                  else if (item.action === 'toggle-language') setLanguage(language === 'th' ? 'en' : 'th');
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
                  <PremiumThemeSwitch
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                    size="md"
                  />
                ) : item.action === 'toggle-language' ? (
                  <PremiumLanguageSwitch
                    size="md"
                  />
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
                  <div className="text-[12px] font-medium text-[#2E1065]/50 dark:text-white/50">{t('settings.adminAppDesc', 'ชื่อ, โลโก้, สีธีม')}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2E1065]/30 dark:text-white/30" />
            </button>
            
            <button
              onClick={() => setActiveModal('adminCategory')}
              className="w-full p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/60 dark:active:bg-white/10 transition-colors border-b border-[#2E1065]/5 dark:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-rose-500/10 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[#2E1065] dark:text-white text-[15px]">{t('settings.manageCategories', 'จัดการหมวดหมู่')}</div>
                  <div className="text-[12px] font-medium text-[#2E1065]/50 dark:text-white/50">{t('settings.adminCatDesc', 'เพิ่ม/แก้ไข หมวดหมู่รายการ')}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2E1065]/30 dark:text-white/30" />
            </button>
            
            <button
              onClick={() => setActiveModal('adminAi')}
              className="w-full p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/60 dark:active:bg-white/10 transition-colors border-b border-[#2E1065]/5 dark:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-purple-500/10 flex items-center justify-center shrink-0">
                  <SettingsIcon className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[#2E1065] dark:text-white text-[15px]">{t('settings.adminAi', 'ตั้งค่าระบบ AI')}</div>
                  <div className="text-[12px] font-medium text-[#2E1065]/50 dark:text-white/50">{t('settings.adminAiDesc', 'จัดการ API Keys')}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2E1065]/30 dark:text-white/30" />
            </button>

            <button
              onClick={() => setActiveModal('adminUsers')}
              className="w-full p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 active:bg-white/60 dark:active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[#2E1065] dark:text-white text-[15px]">{t('settings.adminUsers', 'ผู้ใช้งานทั้งหมด')}</div>
                  <div className="text-[12px] font-medium text-[#2E1065]/50 dark:text-white/50">{t('settings.adminUsersDesc', 'ดูจำนวนผู้ใช้ในระบบ')}</div>
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
      <PrivacyPolicyModal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal('none')} />
      <ExportImportModal isOpen={activeModal === 'export'} onClose={() => setActiveModal('none')} />
      <UserCategoryManagerModal isOpen={activeModal === 'categories'} onClose={() => setActiveModal('none')} />
      <AdminAppInfoModal isOpen={activeModal === 'adminApp'} onClose={() => setActiveModal('none')} />
      <AdminCategoryModal isOpen={activeModal === 'adminCategory'} onClose={() => setActiveModal('none')} />
      <AdminAiModal isOpen={activeModal === 'adminAi'} onClose={() => setActiveModal('none')} />
      <AdminUsersModal isOpen={activeModal === 'adminUsers'} onClose={() => setActiveModal('none')} />
    </div>
  );
}
