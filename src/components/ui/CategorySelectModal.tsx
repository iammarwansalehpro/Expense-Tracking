import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Heart } from 'lucide-react';
import { getCategoryStyle, getAllCategoriesGrouped, getCategoriesByType } from '@/utils/categoryStyles';
import type { TransactionCategory } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import { setUserFavorites } from '@/services/transactionService';

interface CategorySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cat: TransactionCategory) => void;
  type: 'expense' | 'income' | 'savings';
  selectedCategory?: string;
}

export default function CategorySelectModal({ isOpen, onClose, onSelect, type, selectedCategory }: CategorySelectModalProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>(t('transactions.filterAll'));
  
  const favoriteCategories = useAppStore(s => s.favoriteCategories);
  const toggleFavoriteCategory = useAppStore(s => s.toggleFavoriteCategory);
  const user = useAuthStore(s => s.user);

  const appCategories = useAppStore(s => s.appCategories);

  const availableCategories = useMemo(() => {
    if (appCategories && Object.keys(appCategories).length > 0) {
      return Object.keys(appCategories).filter(key => {
        const cat = appCategories[key];
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
    const baseGroups = getAllCategoriesGrouped(availableCategories, appCategories || undefined);
    const favoritesForType = favoriteCategories.filter(fav => availableCategories.includes(fav));
    
    if (favoritesForType.length > 0) {
      return {
        'หมวดหมู่ที่ใช้บ่อย (Favorites)': favoritesForType,
        ...baseGroups
      };
    }
    return baseGroups;
  }, [availableCategories, appCategories, favoriteCategories]);

  // The available tabs are "ทั้งหมด" + all the group names
  const tabs = useMemo(() => {
    return [t('transactions.filterAll'), ...Object.keys(groupedAll)];
  }, [groupedAll, t]);

  const filteredData = useMemo(() => {
    if (search) {
      // If searching, just return a flat grouped list of matched items
      const matched = availableCategories.filter(c => c.toLowerCase().includes(search.toLowerCase()));
      return getAllCategoriesGrouped(matched);
    }
    
    if (activeTab === t('transactions.filterAll')) {
      return groupedAll;
    }
    
    // If a specific tab is selected
    return { [activeTab]: groupedAll[activeTab] || [] };
  }, [availableCategories, search, activeTab, groupedAll]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[150] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Main Content (Glassmorphism) */}
      <div className="relative bg-white/80 backdrop-blur-[30px] border-t border-white/60 rounded-t-[40px] shadow-[0_-10px_40px_rgba(31,38,135,0.15)] flex flex-col h-[90vh] animate-slide-up">
        {/* Drag handle */}
        <div className="p-4 flex justify-center shrink-0">
          <div className="w-16 h-1.5 bg-slate-300/50 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex items-center justify-between shrink-0">
          <h2 className="text-[26px] font-bold text-[#2E1065] tracking-tight">{t('add.selectCategory')}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full border border-white/50 bg-white/40 hover:bg-white/60 text-[#2E1065]/70 shadow-sm transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pb-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2E1065]/50" />
            <input 
              type="text" 
              placeholder={t('transactions.search')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFF9F2] border border-[#FFF9F2]/50 rounded-[20px] py-3.5 pl-12 pr-4 text-[#2E1065] font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 placeholder:text-[#2E1065]/40 shadow-sm"
            />
          </div>
        </div>

        {/* Dynamic Tabs */}
        {!search && tabs.length > 2 && (
          <div className="px-6 flex gap-3 overflow-x-auto no-scrollbar pb-4 shrink-0">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-[16px] whitespace-nowrap text-sm font-bold transition-all shadow-sm ${
                  activeTab === tab 
                    ? 'bg-white/80 text-[#8B5CF6] border border-[#8B5CF6]/30 shadow-sm' 
                    : 'bg-white/40 text-[#2E1065]/70 border border-white/50 hover:bg-white/60'
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
            <div className="text-center text-[#2E1065]/50 font-semibold mt-12 bg-white/40 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-sm">
              {t('transactions.noData')}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(filteredData).map(([group, cats]) => {
                if (cats.length === 0) return null;
                return (
                  <div key={group} className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-[#2E1065]/60 px-2">{group}</h3>
                    <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                      {cats.map((cat) => {
                        const { icon: Icon, color, textColor } = getCategoryStyle(cat, appCategories || undefined);
                        const isSelected = cat === selectedCategory;
                        const isFavorite = favoriteCategories.includes(cat);
                        return (
                          <div key={cat} className="flex flex-col items-center gap-2 group relative">
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] flex items-center justify-center transition-transform group-active:scale-95 shadow-sm border relative ${color} ${textColor}`}>
                              
                              {/* Favorite Toggle */}
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavoriteCategory(cat);
                                  if (user) {
                                    // setTimeout to allow store to update first
                                    setTimeout(() => {
                                      setUserFavorites(user.uid, useAppStore.getState().favoriteCategories);
                                    }, 0);
                                  }
                                }}
                                className="absolute -top-2 -left-2 w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 z-50 active:scale-95 transition-transform"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-[#2E1065]/20 hover:text-red-500 transition-colors'}`} />
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
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#2E1065] rounded-full flex items-center justify-center shadow-md z-10 pointer-events-none">
                                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-[#2E1065]/80 text-center break-words max-w-full px-1">
                              {cat}
                            </span>
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
    </div>,
    document.body
  );
}
