import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Heart, Plus, Settings2, Sparkles } from 'lucide-react';
import { 
  getCategoryStyle, 
  getAllCategoriesGrouped, 
  CATEGORY_SEED, 
  getCategoryDisplayName, 
  getGroupDisplayName,
  matchCategorySearch
} from '@/utils/categoryStyles';
import type { TransactionCategory } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import { setUserFavorites } from '@/services/transactionService';
import { useDragToClose } from '@/hooks/useDragToClose';
import UserCategoryManagerModal from '@/components/settings/UserCategoryManagerModal';
import AutoShrinkText from '@/components/ui/AutoShrinkText';

interface CategorySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cat: TransactionCategory) => void;
  type: import('@/types').TransactionType | 'savings';
  selectedCategory?: string;
}

export default function CategorySelectModal({ isOpen, onClose, onSelect, type, selectedCategory }: CategorySelectModalProps) {
  const { t, language } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const favoriteCategories = useAppStore(s => s.favoriteCategories);
  const toggleFavoriteCategory = useAppStore(s => s.toggleFavoriteCategory);
  const user = useAuthStore(s => s.user);

  const appCategories = useAppStore(s => s.appCategories);
  const userGroups = useAppStore(s => s.userGroups);

  const { handlers: dragHandlers, style: dragStyle } = useDragToClose({
    onClose,
  });

  // Track modal open transitions: ONLY reset search and tab when opening or changing transaction type
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setActiveTab('ALL');
      setSearch('');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    setActiveTab('ALL');
    setSearch('');
  }, [type]);

  const availableCategories = useMemo(() => {
    const cats = appCategories && Object.keys(appCategories).length > 0 ? appCategories : CATEGORY_SEED;
    return Object.keys(cats).filter(key => {
      const cat = cats[key];
      if (cat.hidden) return false;
      if (type === 'income') return cat.tab === 'income';
      if (type === 'expense') return cat.tab !== 'income';
      if (type === 'savings') return cat.tab === 'savings';
      return true;
    });
  }, [type, appCategories]);

  // Group all available categories for the current type
  const groupedAll = useMemo(() => {
    const customOrder = type === 'income' ? userGroups?.income : userGroups?.expense;
    const baseGroups = getAllCategoriesGrouped(availableCategories, appCategories || undefined, customOrder);
    const favoritesForType = favoriteCategories.filter(fav => availableCategories.includes(fav));
    
    if (favoritesForType.length > 0) {
      return {
        'หมวดหมู่ที่ใช้บ่อย (Favorites)': favoritesForType,
        ...baseGroups
      };
    }
    return baseGroups;
  }, [availableCategories, appCategories, favoriteCategories, type, userGroups]);

  // The available tabs are "ALL" + all group names
  const tabs = useMemo(() => {
    return ['ALL', ...Object.keys(groupedAll)];
  }, [groupedAll]);

  const filteredData = useMemo(() => {
    const trimmedQuery = search.trim();
    if (trimmedQuery) {
      // Intelligent bilingual search matching using matchCategorySearch
      const matched = availableCategories.filter(c => {
        const catData = appCategories?.[c] || CATEGORY_SEED[c];
        return matchCategorySearch(c, catData, trimmedQuery, language);
      });
      const customOrder = type === 'income' ? userGroups?.income : userGroups?.expense;
      return getAllCategoriesGrouped(matched, appCategories || undefined, customOrder);
    }
    
    if (activeTab === 'ALL') {
      return groupedAll;
    }
    
    // If a specific tab is selected
    return { [activeTab]: groupedAll[activeTab] || [] };
  }, [availableCategories, search, activeTab, groupedAll, appCategories, type, userGroups, language]);

  const totalResultsCount = useMemo(() => {
    return Object.values(filteredData).reduce((sum, list) => sum + list.length, 0);
  }, [filteredData]);

  if (!isOpen) return null;

  const searchPlaceholder = language === 'en'
    ? 'Search categories e.g. Food, Bills, Grab, Netflix...'
    : 'ค้นหาหมวดหมู่ เช่น อาหาร, ค่าไฟ, food, netflix...';

  return createPortal(
    <>
      <div className="fixed inset-0 z-[150] flex flex-col justify-end">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />

        {/* Main Content (Glassmorphism) */}
        <div 
          {...dragHandlers}
          style={dragStyle}
          className="relative bg-white/95 dark:bg-[#120B24]/95 backdrop-blur-[30px] border-t border-white/60 dark:border-white/10 rounded-t-[40px] shadow-[0_-10px_40px_rgba(31,38,135,0.2)] flex flex-col h-[90vh] animate-slide-up"
        >
          {/* Drag handle */}
          <div className="p-3 flex justify-center shrink-0">
            <div className="w-16 h-1.5 bg-slate-300/60 dark:bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-3 flex items-center justify-between shrink-0 relative">
            <div className="flex-1 text-center pl-10">
              <h2 className="text-xl sm:text-[24px] font-black text-[#2E1065] dark:text-white tracking-tight">
                {t('add.selectCategory')}
              </h2>
            </div>
            
            {/* Quick Manage / Add Category Button */}
            <button
              onClick={() => setIsManagerModalOpen(true)}
              className="p-2 rounded-2xl bg-purple-100 hover:bg-purple-200 dark:bg-white/10 dark:hover:bg-white/20 text-purple-700 dark:text-purple-300 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-sm"
              title={t('settings.manageCategories')}
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('settings.manageCategories')}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-6 pb-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5CF6] dark:text-purple-400" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder={searchPlaceholder} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#FFF9F2] dark:bg-white/5 border border-purple-100 dark:border-white/10 rounded-[20px] py-3 pl-11 pr-10 text-[#2E1065] dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 placeholder:text-[#2E1065]/40 dark:placeholder:text-white/40 shadow-sm transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/80 dark:bg-white/20 hover:bg-slate-300 dark:hover:bg-white/30 text-slate-600 dark:text-white flex items-center justify-center transition-colors"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Search Query Status Banner */}
            {search.trim() && (
              <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 animate-fade-in">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {language === 'en' 
                    ? `Found ${totalResultsCount} ${totalResultsCount === 1 ? 'category' : 'categories'} for "${search.trim()}"`
                    : `พบ ${totalResultsCount} หมวดหมู่สำหรับ "${search.trim()}"`}
                </span>
                <button 
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline text-[11px] font-semibold"
                >
                  {language === 'en' ? 'Clear' : 'ล้างการค้นหา'}
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Tabs (only when not actively searching) */}
          {!search.trim() && tabs.length > 2 && (
            <div className="px-6 flex gap-2 overflow-x-auto no-scrollbar pb-3 shrink-0">
              {tabs.map(tab => {
                const label = tab === 'ALL' ? t('transactions.filterAll') : getGroupDisplayName(tab, language);
                return (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-[14px] whitespace-nowrap text-xs font-bold transition-all shadow-sm ${
                      activeTab === tab 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-[1.02]' 
                        : 'bg-white/60 dark:bg-white/10 text-[#2E1065]/70 dark:text-white/70 border border-white/50 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/15'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Grid View */}
          <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
            {Object.keys(filteredData).length === 0 ? (
              <div className="text-center text-[#2E1065]/60 dark:text-white/60 font-semibold mt-8 bg-white/50 dark:bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm flex flex-col items-center animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-3 shadow-inner">
                  <Search className="w-7 h-7" />
                </div>
                <p className="font-extrabold text-base text-[#2E1065] dark:text-white mb-1">
                  {search.trim() 
                    ? (language === 'en' ? `No categories match "${search.trim()}"` : `ไม่พบหมวดหมู่ที่ตรงกับ "${search.trim()}"`)
                    : t('transactions.noData')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-5">
                  {language === 'en' 
                    ? 'Try searching with another keyword (e.g. food, bill, ride, salary) or add a custom category.'
                    : 'ลองค้นหาด้วยคำอื่น (เช่น อาหาร, กาแฟ, บิล, รถ, เงินเดือน) หรือสร้างหมวดหมู่ใหม่'}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {search.trim() && (
                    <button
                      onClick={() => setSearch('')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-[#2E1065] dark:text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      {language === 'en' ? 'Clear Search' : 'ล้างคำค้นหา'}
                    </button>
                  )}
                  <button
                    onClick={() => setIsManagerModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/25 hover:opacity-95 transition-all inline-flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + {t('settings.addCategory')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 pt-1">
                {Object.entries(filteredData).map(([group, cats]) => {
                  if (cats.length === 0) return null;
                  return (
                    <div key={group} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 px-1 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <AutoShrinkText 
                            origin="left" 
                            className="text-xs font-black text-[#2E1065]/70 dark:text-white/70 uppercase tracking-wider"
                            text={getGroupDisplayName(group, language)}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-purple-600/60 dark:text-purple-400/60 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                          {cats.length}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-y-5 gap-x-2">
                        {cats.map((cat) => {
                          const { icon: Icon, color, textColor } = getCategoryStyle(cat, appCategories || undefined);
                          const isSelected = cat === selectedCategory;
                          const isFavorite = favoriteCategories.includes(cat);
                          const isCustom = !!appCategories?.[cat]?.isCustom;
                          const displayName = getCategoryDisplayName(cat, language);

                          return (
                            <div key={cat} className="flex flex-col items-center gap-1.5 group relative">
                              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] flex items-center justify-center transition-transform group-active:scale-95 shadow-sm border relative ${color} ${textColor}`}>
                                
                                {/* Custom badge */}
                                {isCustom && (
                                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 z-20" title={t('categoryManager.customCategoryBadge')} />
                                )}

                                {/* Favorite Toggle */}
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFavoriteCategory(cat);
                                    if (user) {
                                      setTimeout(() => {
                                        setUserFavorites(user.uid, useAppStore.getState().favoriteCategories);
                                      }, 0);
                                    }
                                  }}
                                  className="absolute -top-1.5 -left-1.5 w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-white/10 z-30 active:scale-95 transition-transform"
                                >
                                  <Heart className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-[#2E1065]/20 dark:text-white/20 hover:text-red-500 transition-colors'}`} />
                                </button>
                                
                                {/* Main Category Button */}
                                <button
                                  className="absolute inset-0 flex items-center justify-center w-full h-full"
                                  onClick={() => {
                                    onSelect(cat as TransactionCategory);
                                    onClose();
                                  }}
                                >
                                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
                                </button>

                                {isSelected && (
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#2E1065] dark:bg-purple-600 rounded-full flex items-center justify-center shadow-md z-20 pointer-events-none border border-white dark:border-slate-900">
                                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="w-full text-center px-0.5 mt-0.5">
                                <AutoShrinkText 
                                  origin="center" 
                                  className="text-[11px] font-bold text-[#2E1065]/80 dark:text-white/80" 
                                  text={displayName} 
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
            )}
          </div>
        </div>
      </div>

      {/* Category & Group Manager Modal */}
      <UserCategoryManagerModal 
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        initialType={type === 'income' ? 'income' : 'expense'}
      />
    </>,
    document.body
  );
}
