import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Heart, Plus, Settings2 } from 'lucide-react';
import { getCategoryStyle, getAllCategoriesGrouped, getCategoriesByType } from '@/utils/categoryStyles';
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
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>(t('transactions.filterAll'));
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  
  const favoriteCategories = useAppStore(s => s.favoriteCategories);
  const toggleFavoriteCategory = useAppStore(s => s.toggleFavoriteCategory);
  const user = useAuthStore(s => s.user);

  const appCategories = useAppStore(s => s.appCategories);
  const userGroups = useAppStore(s => s.userGroups);

  const { handlers: dragHandlers, style: dragStyle } = useDragToClose({
    onClose,
  });

  const availableCategories = useMemo(() => {
    if (appCategories && Object.keys(appCategories).length > 0) {
      return Object.keys(appCategories).filter(key => {
        const cat = appCategories[key];
        if (cat.hidden) return false;
        if (type === 'income') return cat.tab === 'income';
        if (type === 'expense') return cat.tab === 'fixed' || cat.tab === 'lifestyle' || cat.tab === 'savings' || cat.tab === 'all';
        if (type === 'savings') return cat.tab === 'savings';
        return false;
      });
    }
    // Fallback to local constants if not ready
    return getCategoriesByType(type);
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

  // The available tabs are "ทั้งหมด" + all the group names
  const tabs = useMemo(() => {
    return [t('transactions.filterAll'), ...Object.keys(groupedAll)];
  }, [groupedAll, t]);

  const filteredData = useMemo(() => {
    if (search) {
      // If searching, just return a flat grouped list of matched items
      const matched = availableCategories.filter(c => c.toLowerCase().includes(search.toLowerCase()));
      const customOrder = type === 'income' ? userGroups?.income : userGroups?.expense;
      return getAllCategoriesGrouped(matched, appCategories || undefined, customOrder);
    }
    
    if (activeTab === t('transactions.filterAll')) {
      return groupedAll;
    }
    
    // If a specific tab is selected
    return { [activeTab]: groupedAll[activeTab] || [] };
  }, [availableCategories, search, activeTab, groupedAll, appCategories, type, userGroups, t]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[150] flex flex-col justify-end">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />

        {/* Main Content (Glassmorphism) */}
        <div 
          {...dragHandlers}
          style={dragStyle}
          className="relative bg-white/90 dark:bg-[#120B24]/90 backdrop-blur-[30px] border-t border-white/60 dark:border-white/10 rounded-t-[40px] shadow-[0_-10px_40px_rgba(31,38,135,0.15)] flex flex-col h-[90vh] animate-slide-up"
        >
          {/* Drag handle */}
          <div className="p-3 flex justify-center shrink-0">
            <div className="w-16 h-1.5 bg-slate-300/50 dark:bg-white/20 rounded-full" />
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
              className="p-2 rounded-2xl bg-purple-100 hover:bg-purple-200 dark:bg-white/10 dark:hover:bg-white/20 text-purple-700 dark:text-purple-300 transition-colors flex items-center gap-1 text-xs font-bold shrink-0 shadow-sm"
              title="จัดการ / เพิ่มหมวดหมู่ใหม่"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">จัดการหมวดหมู่</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-6 pb-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2E1065]/50 dark:text-white/50" />
              <input 
                type="text" 
                placeholder={t('transactions.search')} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#FFF9F2] dark:bg-white/5 border border-[#FFF9F2]/50 dark:border-white/10 rounded-[20px] py-3 pl-11 pr-4 text-[#2E1065] dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 placeholder:text-[#2E1065]/40 dark:placeholder:text-white/40 shadow-sm"
              />
            </div>
          </div>

          {/* Dynamic Tabs */}
          {!search && tabs.length > 2 && (
            <div className="px-6 flex gap-2 overflow-x-auto no-scrollbar pb-3 shrink-0">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-[14px] whitespace-nowrap text-xs font-bold transition-all shadow-sm ${
                    activeTab === tab 
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                      : 'bg-white/60 dark:bg-white/10 text-[#2E1065]/70 dark:text-white/70 border border-white/50 dark:border-white/5 hover:bg-white/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Grid View */}
          <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
            {Object.keys(filteredData).length === 0 ? (
              <div className="text-center text-[#2E1065]/50 dark:text-white/50 font-semibold mt-12 bg-white/40 dark:bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/50 dark:border-white/10 shadow-sm">
                <p className="font-bold text-sm mb-2">{t('transactions.noData')}</p>
                <button
                  onClick={() => setIsManagerModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-purple-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + เพิ่มหมวดหมู่นี้
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {Object.entries(filteredData).map(([group, cats]) => {
                  if (cats.length === 0) return null;
                  return (
                    <div key={group} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <h3 className="text-xs font-black text-[#2E1065]/70 dark:text-white/70 uppercase tracking-wider">{group}</h3>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-y-5 gap-x-2">
                        {cats.map((cat) => {
                          const { icon: Icon, color, textColor } = getCategoryStyle(cat, appCategories || undefined);
                          const isSelected = cat === selectedCategory;
                          const isFavorite = favoriteCategories.includes(cat);
                          const isCustom = !!appCategories?.[cat]?.isCustom;

                          return (
                            <div key={cat} className="flex flex-col items-center gap-1.5 group relative">
                              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] flex items-center justify-center transition-transform group-active:scale-95 shadow-sm border relative ${color} ${textColor}`}>
                                
                                {/* Custom badge */}
                                {isCustom && (
                                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 z-20" title="หมวดหมู่ที่กำหนดเอง" />
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
