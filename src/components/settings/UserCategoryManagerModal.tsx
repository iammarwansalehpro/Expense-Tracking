import { useState, useMemo } from 'react';
import { 
  X, Plus, Search, Trash2, Edit2, RotateCcw, 
  Tag, FolderTree, Layers, ArrowLeft, Check, 
  ArrowDownRight, ArrowUpRight, Info
} from 'lucide-react';
import AutoShrinkText from '@/components/ui/AutoShrinkText';
import { 
  getCategoryStyle, 
  getAllCategoriesGrouped, 
  AVAILABLE_ICONS, 
  AVAILABLE_COLORS, 
  ICON_CATEGORIES,
  getIconComponent, 
  DEFAULT_EXPENSE_GROUPS,
  DEFAULT_INCOME_GROUPS,
  getCategoryDisplayName,
  getGroupDisplayName,
  getIconCategoryLabel,
  matchIconSearch,
  type DBCategory, 
  type CategoryTab 
} from '@/utils/categoryStyles';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  saveUserCategory, 
  deleteUserCategory, 
  saveUserGroups,
  renameUserGroup,
  deleteUserGroup,
  resetUserCategoriesAndGroups
} from '@/services/transactionService';

interface UserCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'expense' | 'income';
}

type MainTab = 'categories' | 'groups';
type FilterTab = 'all' | 'expense' | 'income' | 'custom';

interface EditGroupState {
  isOpen: boolean;
  oldName: string;
  newName: string;
  type: 'expense' | 'income';
  saving: boolean;
}

export default function UserCategoryManagerModal({ 
  isOpen, 
  onClose,
  initialType = 'expense'
}: UserCategoryManagerModalProps) {
  const { t, language } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const appCategories = useAppStore((s) => s.appCategories);
  const userGroups = useAppStore((s) => s.userGroups);
  const setAppCategories = useAppStore((s) => s.setAppCategories);
  const setUserGroups = useAppStore((s) => s.setUserGroups);

  // Modal navigation states
  const [mainTab, setMainTab] = useState<MainTab>('categories');
  const [filterTab, setFilterTab] = useState<FilterTab>(initialType === 'income' ? 'income' : 'expense');
  const [searchQuery, setSearchQuery] = useState('');
  const [isManageMode, setIsManageMode] = useState(false);
  
  // Category Form State
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCatKey, setEditingCatKey] = useState<string | null>(null);
  const [isOriginalDefault, setIsOriginalDefault] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'expense' | 'income'>(initialType);
  const [formGroup, setFormGroup] = useState('');
  const [formIcon, setFormIcon] = useState('Tag');
  const [formColorIdx, setFormColorIdx] = useState(0);
  const [iconCategoryFilter, setIconCategoryFilter] = useState('all');
  const [iconSearch, setIconSearch] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  // Group Form State
  const [groupType, setGroupType] = useState<'expense' | 'income'>('expense');
  const [newGroupName, setNewGroupName] = useState('');
  const [inlineGroupInput, setInlineGroupInput] = useState('');
  const [showInlineGroupAdd, setShowInlineGroupAdd] = useState(false);

  // Dedicated Modern Edit Group Modal State
  const [editGroupModal, setEditGroupModal] = useState<EditGroupState>({
    isOpen: false,
    oldName: '',
    newName: '',
    type: 'expense',
    saving: false
  });

  // Categories map
  const categoriesMap = useMemo<Record<string, DBCategory>>(() => {
    return appCategories || {};
  }, [appCategories]);

  // Current groups list
  const currentExpenseGroups = useMemo(() => {
    return userGroups?.expense && userGroups.expense.length > 0 
      ? userGroups.expense 
      : DEFAULT_EXPENSE_GROUPS;
  }, [userGroups]);

  const currentIncomeGroups = useMemo(() => {
    return userGroups?.income && userGroups.income.length > 0 
      ? userGroups.income 
      : DEFAULT_INCOME_GROUPS;
  }, [userGroups]);

  // Active groups for currently selected category type
  const activeGroups = useMemo(() => {
    return formType === 'income' ? currentIncomeGroups : currentExpenseGroups;
  }, [formType, currentExpenseGroups, currentIncomeGroups]);

  // Hierarchy statistics summary
  const stats = useMemo(() => {
    const total = Object.keys(categoriesMap).length;
    let customCount = 0;
    let expenseCount = 0;
    let incomeCount = 0;

    Object.values(categoriesMap).forEach(cat => {
      if (cat.isCustom) customCount++;
      if (cat.tab === 'income') incomeCount++;
      else expenseCount++;
    });

    return { total, customCount, expenseCount, incomeCount };
  }, [categoriesMap]);

  // Filtered categories with multilingual search matching
  const filteredCategories = useMemo(() => {
    return Object.entries(categoriesMap).filter(([name, cat]) => {
      if (cat.hidden) return false;

      if (filterTab === 'expense' && cat.tab === 'income') return false;
      if (filterTab === 'income' && cat.tab !== 'income') return false;
      if (filterTab === 'custom' && !cat.isCustom) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const localizedName = getCategoryDisplayName(name, language).toLowerCase();
        const matchesName = name.toLowerCase().includes(query) || localizedName.includes(query);
        const localizedGroup = getGroupDisplayName(cat.group || '', language).toLowerCase();
        const matchesGroup = (cat.group?.toLowerCase().includes(query)) || localizedGroup.includes(query);
        return matchesName || matchesGroup;
      }

      return true;
    });
  }, [categoriesMap, filterTab, searchQuery, language]);

  // Grouped filtered categories according to user group order
  const groupedCategories = useMemo(() => {
    const catNames = filteredCategories.map(([name]) => name);
    const customOrder = filterTab === 'income' 
      ? currentIncomeGroups 
      : filterTab === 'expense'
      ? currentExpenseGroups
      : [...currentExpenseGroups, ...currentIncomeGroups];
    return getAllCategoriesGrouped(catNames, categoriesMap, customOrder);
  }, [filteredCategories, categoriesMap, filterTab, currentExpenseGroups, currentIncomeGroups]);

  // Category counts per group
  const groupCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(categoriesMap).forEach(cat => {
      if (!cat.hidden) {
        counts[cat.group] = (counts[cat.group] || 0) + 1;
      }
    });
    return counts;
  }, [categoriesMap]);

  // Filtered icons with intelligent bilingual semantic search
  const filteredIcons = useMemo(() => {
    let icons = AVAILABLE_ICONS;
    
    if (iconCategoryFilter !== 'all') {
      const catObj = ICON_CATEGORIES.find(c => c.name === iconCategoryFilter);
      if (catObj) {
        icons = catObj.icons;
      }
    }

    if (iconSearch.trim()) {
      icons = icons.filter(iconName => matchIconSearch(iconName, iconSearch));
    }

    return icons;
  }, [iconCategoryFilter, iconSearch]);

  // Action: Open Add Category
  const handleOpenAddCategory = (presetName?: string) => {
    setEditingCatKey(null);
    setIsOriginalDefault(false);
    setFormName(presetName || '');
    const targetType = filterTab === 'income' ? 'income' : 'expense';
    setFormType(targetType);
    const groups = targetType === 'income' ? currentIncomeGroups : currentExpenseGroups;
    setFormGroup(groups[0] || 'อื่นๆ');
    setFormIcon('Tag');
    setFormColorIdx(0);
    setIconCategoryFilter('all');
    setIconSearch('');
    setShowInlineGroupAdd(false);
    setInlineGroupInput('');
    setIsEditingCategory(true);
  };

  // Action: Open Edit Category
  const handleOpenEditCategory = (catName: string) => {
    const cat = categoriesMap[catName];
    if (!cat) return;

    setEditingCatKey(catName);
    setIsOriginalDefault(!!cat.isDefault);
    setFormName(catName);
    setFormType(cat.tab === 'income' ? 'income' : 'expense');
    setFormGroup(cat.group || 'อื่นๆ');
    setFormIcon(cat.iconName || 'Tag');

    const cleanColor = cat.color.replace(' border-white/50', '').trim();
    const colorIdx = AVAILABLE_COLORS.findIndex(c => c.color === cleanColor);
    setFormColorIdx(colorIdx >= 0 ? colorIdx : 0);

    setIconCategoryFilter('all');
    setIconSearch('');
    setShowInlineGroupAdd(false);
    setInlineGroupInput('');
    setIsEditingCategory(true);
  };

  // Action: Save Category
  const handleSaveCategory = async () => {
    const cleanName = formName.trim();
    if (!cleanName) {
      useToastStore.getState().addToast(t('categoryManager.toastNameRequired'), 'error');
      return;
    }

    if (!editingCatKey || editingCatKey !== cleanName) {
      if (categoriesMap[cleanName] && !categoriesMap[cleanName].hidden) {
        useToastStore.getState().addToast(t('categoryManager.toastCategoryExists'), 'error');
        return;
      }
    }

    if (!user) {
      useToastStore.getState().addToast(t('categoryManager.toastLoginRequired'), 'error');
      return;
    }

    setSavingCategory(true);
    try {
      const colorObj = AVAILABLE_COLORS[formColorIdx] || AVAILABLE_COLORS[0];
      const targetTab: CategoryTab = formType === 'income' 
        ? 'income' 
        : (formGroup === 'ค่าใช้จ่ายประจำ' ? 'fixed' : 'lifestyle');

      const categoryPayload: DBCategory = {
        iconName: formIcon,
        color: `${colorObj.color} border-white/50`,
        textColor: colorObj.textColor,
        tab: targetTab,
        group: formGroup || (formType === 'income' ? 'รายรับ' : 'ไลฟ์สไตล์'),
        isDefault: isOriginalDefault && editingCatKey === cleanName,
        isCustom: !isOriginalDefault || editingCatKey !== cleanName,
        updatedAt: Date.now()
      };

      if (editingCatKey && editingCatKey !== cleanName) {
        await deleteUserCategory(user.uid, editingCatKey, isOriginalDefault);
      }

      await saveUserCategory(user.uid, cleanName, categoryPayload);

      const updatedCategories = { ...categoriesMap };
      if (editingCatKey && editingCatKey !== cleanName) {
        delete updatedCategories[editingCatKey];
      }
      updatedCategories[cleanName] = categoryPayload;
      setAppCategories(updatedCategories);

      useToastStore.getState().addToast(
        editingCatKey ? t('categoryManager.toastCategoryUpdated') : t('categoryManager.toastCategoryAdded'), 
        'success'
      );
      setIsEditingCategory(false);
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast(t('categoryManager.toastSaveError'), 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  // Action: Delete Category
  const handleDeleteCategory = (catName: string) => {
    const cat = categoriesMap[catName];
    if (!cat || !user) return;

    const isDef = !!cat.isDefault;
    const displayName = getCategoryDisplayName(catName, language);

    useConfirmStore.getState().showConfirm({
      title: isDef ? t('categoryManager.confirmHideTitle') : t('categoryManager.confirmDeleteTitle'),
      message: isDef 
        ? t('categoryManager.confirmHideMessage').replace('{name}', displayName)
        : t('categoryManager.confirmDeleteMessage').replace('{name}', displayName),
      confirmText: isDef ? t('categoryManager.confirmHideBtn') : t('categoryManager.confirmDeleteBtn'),
      cancelText: t('categoryManager.cancel'),
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteUserCategory(user.uid, catName, isDef);
          
          const next = { ...categoriesMap };
          delete next[catName];
          setAppCategories(next);

          useToastStore.getState().addToast(
            isDef ? t('categoryManager.toastCategoryHidden') : t('categoryManager.toastCategoryDeleted'), 
            'success'
          );
        } catch (error) {
          useToastStore.getState().addToast(t('categoryManager.toastDeleteError'), 'error');
        }
      }
    });
  };

  // Action: Add Inline Group
  const handleAddInlineGroup = async () => {
    const cleanGroup = inlineGroupInput.trim();
    if (!cleanGroup || !user) return;

    const groupsList = formType === 'income' ? currentIncomeGroups : currentExpenseGroups;
    if (groupsList.includes(cleanGroup)) {
      setFormGroup(cleanGroup);
      setShowInlineGroupAdd(false);
      setInlineGroupInput('');
      return;
    }

    const updatedGroups = {
      expense: formType === 'expense' ? [...currentExpenseGroups, cleanGroup] : currentExpenseGroups,
      income: formType === 'income' ? [...currentIncomeGroups, cleanGroup] : currentIncomeGroups
    };

    try {
      await saveUserGroups(user.uid, updatedGroups);
      setUserGroups(updatedGroups);
      setFormGroup(cleanGroup);
      setShowInlineGroupAdd(false);
      setInlineGroupInput('');
      useToastStore.getState().addToast(t('categoryManager.toastGroupAdded').replace('{name}', cleanGroup), 'success');
    } catch (e) {
      useToastStore.getState().addToast(t('categoryManager.toastGroupAddError'), 'error');
    }
  };

  // Action: Add Group in Group Manager
  const handleAddGroup = async () => {
    const clean = newGroupName.trim();
    if (!clean || !user) return;

    const list = groupType === 'income' ? currentIncomeGroups : currentExpenseGroups;
    if (list.includes(clean)) {
      useToastStore.getState().addToast(t('categoryManager.toastGroupExists'), 'error');
      return;
    }

    const updated = {
      expense: groupType === 'expense' ? [...currentExpenseGroups, clean] : currentExpenseGroups,
      income: groupType === 'income' ? [...currentIncomeGroups, clean] : currentIncomeGroups
    };

    try {
      await saveUserGroups(user.uid, updated);
      setUserGroups(updated);
      setNewGroupName('');
      useToastStore.getState().addToast(t('categoryManager.toastGroupAdded').replace('{name}', clean), 'success');
    } catch (e) {
      useToastStore.getState().addToast(t('categoryManager.toastGroupAddError'), 'error');
    }
  };

  // Action: Open Edit Group Modal
  const handleOpenEditGroupModal = (groupName: string) => {
    if (groupName === 'อื่นๆ') {
      useToastStore.getState().addToast(t('categoryManager.toastCannotRenameOther'), 'error');
      return;
    }

    setEditGroupModal({
      isOpen: true,
      oldName: groupName,
      newName: groupName,
      type: groupType,
      saving: false
    });
  };

  // Action: Save Renamed Group
  const handleSaveRenameGroup = async () => {
    const cleanNewName = editGroupModal.newName.trim();
    if (!cleanNewName) {
      useToastStore.getState().addToast(t('categoryManager.toastNameRequired'), 'error');
      return;
    }

    if (cleanNewName === editGroupModal.oldName) {
      setEditGroupModal(prev => ({ ...prev, isOpen: false }));
      return;
    }

    if (!user) return;

    const list = editGroupModal.type === 'income' ? currentIncomeGroups : currentExpenseGroups;
    if (list.includes(cleanNewName)) {
      useToastStore.getState().addToast(t('categoryManager.toastGroupExistsSystem'), 'error');
      return;
    }

    setEditGroupModal(prev => ({ ...prev, saving: true }));
    try {
      const { updatedGroups, updatedCategories } = await renameUserGroup(
        user.uid, 
        editGroupModal.type, 
        editGroupModal.oldName, 
        cleanNewName, 
        categoriesMap
      );
      setUserGroups(updatedGroups);
      setAppCategories(updatedCategories);
      useToastStore.getState().addToast(t('categoryManager.toastGroupRenamed'), 'success');
      setEditGroupModal(prev => ({ ...prev, isOpen: false, saving: false }));
    } catch (e) {
      useToastStore.getState().addToast(t('categoryManager.toastGroupRenameError'), 'error');
      setEditGroupModal(prev => ({ ...prev, saving: false }));
    }
  };

  // Action: Delete Group
  const handleDeleteGroup = (groupName: string) => {
    if (groupName === 'อื่นๆ') {
      useToastStore.getState().addToast(t('categoryManager.toastCannotDeleteOther'), 'error');
      return;
    }

    if (!user) return;

    const displayName = getGroupDisplayName(groupName, language);

    useConfirmStore.getState().showConfirm({
      title: t('categoryManager.confirmDeleteGroupTitle'),
      message: t('categoryManager.confirmDeleteGroupMessage').replace('{name}', displayName),
      confirmText: t('categoryManager.confirmDeleteGroupBtn'),
      cancelText: t('categoryManager.cancel'),
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { updatedGroups, updatedCategories } = await deleteUserGroup(
            user.uid,
            groupType,
            groupName,
            categoriesMap
          );
          setUserGroups(updatedGroups);
          setAppCategories(updatedCategories);
          useToastStore.getState().addToast(t('categoryManager.toastGroupDeleted'), 'success');
        } catch (e) {
          useToastStore.getState().addToast(t('categoryManager.toastGroupDeleteError'), 'error');
        }
      }
    });
  };

  // Action: Reset Categories & Groups
  const handleResetToDefaults = () => {
    if (!user) return;

    useConfirmStore.getState().showConfirm({
      title: t('categoryManager.confirmResetTitle'),
      message: t('categoryManager.confirmResetMessage'),
      confirmText: t('categoryManager.confirmResetBtn'),
      cancelText: t('categoryManager.cancel'),
      isDestructive: true,
      onConfirm: async () => {
        try {
          const { categories, groups } = await resetUserCategoriesAndGroups(user.uid);
          setAppCategories(categories);
          setUserGroups(groups);
          useToastStore.getState().addToast(t('categoryManager.toastResetSuccess'), 'success');
        } catch (e) {
          useToastStore.getState().addToast(t('categoryManager.toastResetError'), 'error');
        }
      }
    });
  };

  if (!isOpen) return null;

  const activeColorObj = AVAILABLE_COLORS[formColorIdx] || AVAILABLE_COLORS[0];
  const ActiveIconComponent = getIconComponent(formIcon);

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-end p-2 sm:p-4 md:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F0720]/70 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Main Friendly & Colorful Modal Panel */}
      <div className="relative bg-white dark:bg-[#120B24] rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_rgba(46,16,101,0.2)] w-full max-w-lg mx-auto max-h-[90vh] flex flex-col animate-slide-up border border-purple-100/80 dark:border-purple-900/40 overflow-hidden">
        
        {/* Layer 1: Header Bar */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-50/90 via-pink-50/40 to-indigo-50/90 dark:from-purple-950/40 dark:via-[#1A0F33]/60 dark:to-indigo-950/40 border-b border-purple-100/60 dark:border-purple-900/30 z-20">
          <div className="flex items-center gap-3">
            {isEditingCategory ? (
              <button 
                onClick={() => setIsEditingCategory(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-purple-100/80 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-800/60 text-purple-700 dark:text-purple-300 transition-colors shadow-sm"
                title={t('categoryManager.backTooltip')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
                <Layers className="w-5 h-5" />
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <AutoShrinkText 
                origin="left" 
                className="text-base sm:text-lg font-black text-[#2E1065] dark:text-white tracking-tight"
                text={isEditingCategory 
                  ? (editingCatKey ? t('categoryManager.titleEdit') : t('categoryManager.titleCreate'))
                  : (mainTab === 'categories' ? t('categoryManager.title') : t('categoryManager.titleGroups'))}
              />
              <AutoShrinkText 
                origin="left" 
                className="text-[11px] font-bold text-purple-600/70 dark:text-purple-300/70"
                text={isEditingCategory 
                  ? t('categoryManager.subtitleEdit')
                  : t('categoryManager.subtitleStats')
                      .replace('{total}', String(stats.total))
                      .replace('{custom}', String(stats.customCount))
                      .replace('{groups}', String(currentExpenseGroups.length + currentIncomeGroups.length))}
              />
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-9 h-9 flex items-center justify-center rounded-2xl bg-purple-100/60 hover:bg-purple-200/80 dark:bg-white/10 dark:hover:bg-white/20 text-purple-700 dark:text-purple-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Layer 2: Main Tab Navigation (Categories vs Groups) */}
        {!isEditingCategory && (
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
                {t('categoryManager.tabCategories')}
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
                {t('categoryManager.tabGroups')}
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        {isEditingCategory ? (
          /* ========================================================================= */
          /* CATEGORY EDIT / CREATE SUBVIEW (Friendly Colorful Flow)                  */
          /* ========================================================================= */
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-5">
            
            {/* Step 1: Live Preview (Warm, Colorful & Friendly) */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FAF5FF] via-[#F5F3FF] to-[#EDE9FE] dark:from-[#1A0F33] dark:via-[#20133E] dark:to-[#2A1752] border border-purple-200/70 dark:border-purple-800/40 flex flex-col items-center justify-center relative shadow-sm">
              <div className="absolute top-3 right-4 text-[10px] font-black text-purple-500/70 dark:text-purple-300/70 tracking-wider uppercase">
                {t('categoryManager.livePreview')}
              </div>

              <div className="flex items-center gap-4 my-1 w-full max-w-xs">
                <div className={`w-15 h-15 rounded-2xl flex items-center justify-center border shadow-md ${activeColorObj.color} ${activeColorObj.textColor} transition-all duration-300`}>
                  <ActiveIconComponent className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <AutoShrinkText 
                    origin="left"
                    className="text-base font-black text-[#2E1065] dark:text-white tracking-tight"
                    text={getCategoryDisplayName(formName.trim(), language) || t('categoryManager.categoryNamePlaceholder')}
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      formType === 'income' 
                        ? 'bg-emerald-100/90 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800' 
                        : 'bg-rose-100/90 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                    }`}>
                      {formType === 'income' ? t('categoryManager.filterIncome') : t('categoryManager.filterExpense')}
                    </span>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                      {getGroupDisplayName(formGroup, language) || t('categoryManager.unspecifiedGroup')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Transaction Type */}
            <div>
              <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200 mb-1.5 block">
                {t('categoryManager.transactionType')}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setFormType('expense');
                    if (!currentExpenseGroups.includes(formGroup)) {
                      setFormGroup(currentExpenseGroups[0] || 'อื่นๆ');
                    }
                  }}
                  className={`py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                    formType === 'expense'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 border-transparent'
                      : 'bg-rose-50/70 border-rose-200/80 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300 hover:bg-rose-100/70'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  {t('categoryManager.expenseType')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormType('income');
                    if (!currentIncomeGroups.includes(formGroup)) {
                      setFormGroup(currentIncomeGroups[0] || 'อื่นๆ');
                    }
                  }}
                  className={`py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                    formType === 'income'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 border-transparent'
                      : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-100/70'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  {t('categoryManager.incomeType')}
                </button>
              </div>
            </div>

            {/* Step 3: Category Name */}
            <div>
              <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200 mb-1.5 block">
                {t('categoryManager.categoryName')}
              </label>
              <input 
                type="text" 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t('categoryManager.categoryNameInputPlaceholder')}
                className="w-full bg-[#FFF9F2] dark:bg-white/5 rounded-2xl px-4 py-3 text-xs font-bold border border-purple-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-purple-400/40 text-[#2E1065] dark:text-white placeholder:text-[#2E1065]/40 dark:placeholder:text-white/40 shadow-sm"
                maxLength={30}
              />
            </div>

            {/* Step 4: Group Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200">
                  {t('categoryManager.assignedGroup')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowInlineGroupAdd(!showInlineGroupAdd)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-300 dark:hover:text-white flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('categoryManager.createNewGroup')}
                </button>
              </div>

              {showInlineGroupAdd && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 mb-2.5 flex gap-2 animate-fade-in shadow-sm">
                  <input
                    type="text"
                    value={inlineGroupInput}
                    onChange={(e) => setInlineGroupInput(e.target.value)}
                    placeholder={t('categoryManager.newGroupInputPlaceholder')}
                    className="flex-1 bg-white dark:bg-[#120B24] rounded-xl px-3 py-1.5 text-xs font-bold border border-purple-100 dark:border-purple-800 outline-none text-[#2E1065] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddInlineGroup}
                    disabled={!inlineGroupInput.trim()}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 shadow-sm"
                  >
                    {t('categoryManager.add')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInlineGroupAdd(false)}
                    className="px-2 py-1.5 text-purple-400 hover:text-purple-600 text-xs font-bold"
                  >
                    {t('categoryManager.cancel')}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[120px] overflow-y-auto no-scrollbar p-2 bg-purple-50/50 dark:bg-white/5 rounded-2xl border border-purple-100/60 dark:border-white/10">
                {activeGroups.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormGroup(g)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between min-w-0 ${
                      formGroup === g
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-white/80 dark:bg-white/10 text-[#2E1065]/70 dark:text-white/70 hover:bg-purple-100/60 dark:hover:bg-white/20 border border-purple-100/50 dark:border-white/5'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-1">
                      <AutoShrinkText origin="left" className="text-xs font-bold" text={getGroupDisplayName(g, language)} />
                    </div>
                    {formGroup === g && <Check className="w-3 h-3 shrink-0" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Color Palette (Non-overlapping concentric indicator - No checkmark) */}
            <div>
              <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200 mb-1.5 block">
                {t('categoryManager.selectColor')}
              </label>
              <div className="grid grid-cols-8 gap-2 p-3 bg-purple-50/50 dark:bg-white/5 rounded-2xl border border-purple-100/60 dark:border-white/10">
                {AVAILABLE_COLORS.map((c, idx) => {
                  const isSelected = formColorIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormColorIdx(idx)}
                      title={c.name}
                      className={`aspect-square rounded-full flex items-center justify-center p-0.5 transition-all ${
                        isSelected 
                          ? 'border-2 border-purple-600 dark:border-purple-400 bg-white dark:bg-[#120B24] shadow-sm' 
                          : 'border-2 border-transparent hover:scale-105'
                      }`}
                    >
                      <span 
                        className={`w-full h-full rounded-full ${c.solidColor} shadow-inner transition-transform duration-150 ${
                          isSelected ? 'scale-85' : 'scale-100 opacity-80 hover:opacity-100'
                        }`} 
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 6: Icon Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200">
                  {t('categoryManager.selectIcon')}
                </label>
                <div className="relative w-36">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="text"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder={t('categoryManager.searchIconsPlaceholder')}
                    className="w-full bg-[#FFF9F2] dark:bg-white/5 rounded-xl pl-7 pr-2 py-1.5 text-[11px] font-bold outline-none border border-purple-100 dark:border-white/10 text-[#2E1065] dark:text-white"
                  />
                </div>
              </div>

              {/* Icon Categories */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1.5 mb-1.5">
                <button
                  type="button"
                  onClick={() => setIconCategoryFilter('all')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                    iconCategoryFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-50 dark:bg-white/10 text-purple-700 dark:text-purple-300'
                  }`}
                >
                  {t('categoryManager.iconCategoryAll')}
                </button>
                {ICON_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setIconCategoryFilter(cat.name)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                      iconCategoryFilter === cat.name
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-purple-50 dark:bg-white/10 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {getIconCategoryLabel(cat, language)}
                  </button>
                ))}
              </div>

              {/* Icon Grid */}
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5 max-h-[140px] overflow-y-auto no-scrollbar p-2.5 bg-purple-50/50 dark:bg-white/5 rounded-2xl border border-purple-100/60 dark:border-white/10">
                {filteredIcons.length === 0 ? (
                  <div className="col-span-full py-6 text-center text-xs font-bold text-[#2E1065]/50 dark:text-white/50">
                    {language === 'en' ? 'No icons found' : 'ไม่พบไอคอนที่ตรงกับคำค้นหา'}
                  </div>
                ) : (
                  filteredIcons.map((iconName) => {
                    const IconComp = getIconComponent(iconName);
                    const isSelected = formIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIcon(iconName)}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 scale-105' 
                            : 'bg-white/80 dark:bg-white/5 text-purple-900 dark:text-white/80 hover:bg-purple-100/80 hover:text-purple-700 border border-purple-100/60 dark:border-white/5'
                        }`}
                      >
                        <IconComp className="w-4 h-4" strokeWidth={isSelected ? 2.8 : 2} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Step 7: Form Action Buttons (Standard: Cancel Left, Save Right, Isolated Destructive Action) */}
            <div className="space-y-2.5 pt-2 pb-2">
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditingCategory(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs bg-purple-100/70 hover:bg-purple-200 dark:bg-white/10 dark:hover:bg-white/20 text-purple-800 dark:text-purple-200 transition-colors"
                >
                  {t('categoryManager.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  disabled={savingCategory || !formName.trim()}
                  className="flex-[2] py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:brightness-105 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/30 active:scale-98"
                >
                  {savingCategory ? (
                    <>{t('categoryManager.saving')}</>
                  ) : (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                      {editingCatKey ? t('categoryManager.saveChanges') : t('categoryManager.confirmAdd')}
                    </>
                  )}
                </button>
              </div>

              {/* Isolated Destructive Button (Prevents accidental clicks) */}
              {editingCatKey && (
                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/60">
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteCategory(editingCatKey);
                      setIsEditingCategory(false);
                    }}
                    className="w-full py-2.5 rounded-2xl font-bold text-xs bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/40 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isOriginalDefault ? t('categoryManager.hideCategory') : t('categoryManager.deleteCategory')}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : mainTab === 'categories' ? (
          /* ========================================================================= */
          /* CATEGORIES OVERVIEW TAB (Colorful & Friendly)                            */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Section 1: Search & Filter Scope */}
            <div className="p-4 pb-2 space-y-2.5 bg-white dark:bg-[#120B24] shrink-0 border-b border-purple-100/60 dark:border-purple-900/30">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('categoryManager.searchPlaceholder')}
                  className="w-full bg-[#FFF9F2] dark:bg-white/5 border border-purple-100 dark:border-white/10 rounded-2xl py-2.5 pl-10 pr-9 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-400/40 text-[#2E1065] dark:text-white placeholder:text-[#2E1065]/40 dark:placeholder:text-white/40 shadow-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Segmented Filter Pills & Delete Mode Button (Unclipped Soft Shadows) */}
              <div className="flex items-center justify-between gap-2 py-0.5">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 -mx-1 flex-1 items-center">
                  {[
                    { id: 'all', label: t('categoryManager.filterAll'), count: stats.total },
                    { id: 'expense', label: t('categoryManager.filterExpense'), count: stats.expenseCount },
                    { id: 'income', label: t('categoryManager.filterIncome'), count: stats.incomeCount },
                    { id: 'custom', label: t('categoryManager.filterCustom'), count: stats.customCount },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterTab(tab.id as FilterTab)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 ${
                        filterTab === tab.id
                          ? 'bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white shadow-md shadow-purple-500/30 scale-[1.02]'
                          : 'bg-purple-50/80 dark:bg-white/5 text-[#2E1065]/70 dark:text-purple-200/70 hover:bg-purple-100/80 dark:hover:bg-white/10 hover:text-purple-900 dark:hover:text-white border border-purple-100/60 dark:border-white/5'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold transition-colors ${
                        filterTab === tab.id 
                          ? 'bg-white/20 text-white shadow-inner' 
                          : 'bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Quick Delete Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsManageMode(!isManageMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 border active:scale-95 ${
                    isManageMode
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30 ring-1 ring-rose-400/40'
                      : 'bg-rose-50/80 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/40 hover:bg-rose-100/80 hover:text-rose-700'
                  }`}
                  title={t('categoryManager.deleteModeTitle')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isManageMode ? t('categoryManager.done') : t('categoryManager.deleteMode')}</span>
                </button>
              </div>
            </div>

            {/* Section 2: Grouped Category List Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
              {Object.keys(groupedCategories).length === 0 ? (
                /* Empty state with Smart Quick Add Action */
                <div className="text-center py-10 px-4 bg-purple-50/30 dark:bg-white/5 rounded-3xl border border-purple-100/50 dark:border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mx-auto mb-2 text-purple-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-[#2E1065] dark:text-white text-xs mb-3">{t('categoryManager.noCategoriesFound')}</p>
                  {searchQuery.trim() && (
                    <button
                      onClick={() => handleOpenAddCategory(searchQuery.trim())}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-purple-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('categoryManager.createCategory').replace('{name}', searchQuery.trim())}
                    </button>
                  )}
                </div>
              ) : (
                Object.entries(groupedCategories).map(([groupName, cats]) => {
                  if (cats.length === 0) return null;
                  const localizedGroupName = getGroupDisplayName(groupName, language);
                  return (
                    <div key={groupName} className="space-y-3">
                      {/* Group Header */}
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <AutoShrinkText 
                              origin="left" 
                              className="text-xs font-black text-[#2E1065] dark:text-purple-200 uppercase tracking-wide"
                              text={localizedGroupName}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.2 rounded-md shrink-0">
                            {cats.length}
                          </span>
                        </div>
                      </div>

                      {/* Category Grid Cards */}
                      <div className="grid grid-cols-4 gap-y-4 gap-x-2.5">
                        {cats.map((catName) => {
                          const catObj = categoriesMap[catName];
                          const { icon: Icon, color, textColor } = getCategoryStyle(catName, categoriesMap);
                          const isCustom = !!catObj?.isCustom;
                          const displayName = getCategoryDisplayName(catName, language);

                          return (
                            <div 
                              key={catName}
                              className="flex flex-col items-center gap-1 group relative"
                            >
                              {/* Category Icon Card */}
                              <div 
                                onClick={() => handleOpenEditCategory(catName)}
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] flex items-center justify-center border relative ${color} ${textColor} cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm`}
                              >
                                <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.2} />

                                {/* Custom Badge Dot */}
                                {isCustom && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" title={t('categoryManager.customCategoryBadge')} />
                                )}

                                {/* Delete / Hide Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCategory(catName);
                                  }}
                                  className={`absolute -top-1.5 -left-1.5 rounded-full flex items-center justify-center transition-all z-20 shadow-md ${
                                    isManageMode
                                      ? 'w-6 h-6 bg-rose-500 text-white border-2 border-white dark:border-slate-900 scale-110 opacity-100 animate-pulse cursor-pointer'
                                      : 'w-5 h-5 bg-white dark:bg-slate-800 text-rose-500 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-rose-500 hover:text-white'
                                  }`}
                                  title={isCustom ? t('categoryManager.deleteCategory') : t('categoryManager.hideCategory')}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Category Label with Smart Auto Text Fit */}
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
                })
              )}
            </div>

            {/* Section 3: Primary Sticky Actions Bar */}
            <div className="p-3.5 bg-white dark:bg-[#120B24] border-t border-purple-100/60 dark:border-purple-900/30 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-3.5 py-3 rounded-2xl text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-white bg-purple-50 hover:bg-purple-100 dark:bg-white/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title={t('categoryManager.confirmResetTitle')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('categoryManager.resetDefaults')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddCategory()}
                className="flex-1 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:brightness-105 text-white active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                {t('categoryManager.addNewCategory')}
              </button>
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* GROUP MANAGEMENT TAB (Colorful & Friendly)                               */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Section 1: Group Type & Quick Creation */}
            <div className="p-4 bg-white dark:bg-[#120B24] shrink-0 border-b border-purple-100/60 dark:border-purple-900/30 space-y-2.5">
              <div className="grid grid-cols-2 p-1.5 bg-purple-50/80 dark:bg-purple-950/30 rounded-2xl border border-purple-100/60 dark:border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setGroupType('expense')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    groupType === 'expense'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25'
                      : 'text-[#2E1065]/70 dark:text-white/70'
                  }`}
                >
                  {t('categoryManager.expenseGroups')} ({currentExpenseGroups.length})
                </button>
                <button
                  type="button"
                  onClick={() => setGroupType('income')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    groupType === 'income'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                      : 'text-[#2E1065]/70 dark:text-white/70'
                  }`}
                >
                  {t('categoryManager.incomeGroups')} ({currentIncomeGroups.length})
                </button>
              </div>

              {/* Add New Group Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                  placeholder={groupType === 'income' ? t('categoryManager.newGroupPlaceholderIncome') : t('categoryManager.newGroupPlaceholderExpense')}
                  className="flex-1 bg-[#FFF9F2] dark:bg-white/5 border border-purple-100 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-400/40 text-[#2E1065] dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddGroup}
                  disabled={!newGroupName.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0 shadow-md shadow-purple-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('categoryManager.addGroup')}
                </button>
              </div>
            </div>

            {/* Section 2: Group List Cards */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2.5">
              {(groupType === 'income' ? currentIncomeGroups : currentExpenseGroups).map((g) => {
                const count = groupCategoryCounts[g] || 0;
                const isDefaultProtected = g === 'อื่นๆ';
                const localizedGroupName = getGroupDisplayName(g, language);

                return (
                  <div 
                    key={g}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/60 to-white dark:from-purple-950/20 dark:to-white/5 border border-purple-100/80 dark:border-purple-900/40 flex items-center justify-between hover:border-purple-300 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <AutoShrinkText origin="left" className="text-xs font-bold text-[#2E1065] dark:text-white" text={localizedGroupName} />
                        <span className="text-[10px] font-bold text-purple-600/70 dark:text-purple-300/70 block">
                          {t('categoryManager.categoriesCount').replace('{count}', String(count))}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isDefaultProtected && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEditGroupModal(g)}
                            className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-white border border-purple-100 dark:border-white/10 flex items-center justify-center transition-colors shadow-sm"
                            title={t('categoryManager.editGroupName')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(g)}
                            className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 text-rose-500 hover:text-rose-700 border border-rose-100 dark:border-white/10 flex items-center justify-center transition-colors shadow-sm"
                            title={t('categoryManager.confirmDeleteGroupBtn')}
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

            {/* Section 3: Reset Footer */}
            <div className="p-3.5 bg-white dark:bg-[#120B24] border-t border-purple-100/60 dark:border-purple-900/30 shrink-0">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="w-full py-3 rounded-2xl text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-white bg-purple-50/80 hover:bg-purple-100 dark:bg-white/10 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('categoryManager.resetAllDefaults')}
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Modern & Sleek Edit Group Modal (Sub-Modal - Colorful & Friendly) */}
      {editGroupModal.isOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0F0720]/75 backdrop-blur-md transition-opacity"
            onClick={() => !editGroupModal.saving && setEditGroupModal(prev => ({ ...prev, isOpen: false }))}
          />

          {/* Modal Box */}
          <div className="relative bg-white dark:bg-[#120B24] rounded-[32px] shadow-2xl w-full max-w-sm border border-purple-100 dark:border-purple-900/40 overflow-hidden animate-slide-up p-6 z-10">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#2E1065] dark:text-white tracking-tight">
                    {t('categoryManager.editGroupTitle')}
                  </h3>
                  <p className="text-[11px] font-bold text-purple-600/70 dark:text-purple-300/70">
                    {editGroupModal.type === 'income' ? t('categoryManager.editGroupSubtitleIncome') : t('categoryManager.editGroupSubtitleExpense')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditGroupModal(prev => ({ ...prev, isOpen: false }))}
                disabled={editGroupModal.saving}
                className="w-8 h-8 rounded-xl bg-purple-100/60 hover:bg-purple-200 dark:bg-white/10 dark:hover:bg-white/20 text-purple-700 dark:text-purple-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2E1065] dark:text-purple-200 mb-1.5 block">
                  {t('categoryManager.originalGroupName')} <span className="font-black text-purple-700 dark:text-purple-300">{getGroupDisplayName(editGroupModal.oldName, language)}</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={editGroupModal.newName}
                  onChange={(e) => setEditGroupModal(prev => ({ ...prev, newName: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRenameGroup()}
                  placeholder={t('categoryManager.enterNewGroupName')}
                  className="w-full bg-[#FFF9F2] dark:bg-white/5 rounded-2xl px-4 py-3 text-xs font-bold border border-purple-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-purple-400/40 text-[#2E1065] dark:text-white"
                  maxLength={30}
                />
              </div>

              {/* Info Notice */}
              <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30 flex items-start gap-2.5 text-[11px] text-purple-800 dark:text-purple-200">
                <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <span className="font-medium">
                  {t('categoryManager.groupUpdateNotice').replace('{count}', String(groupCategoryCounts[editGroupModal.oldName] || 0))}
                </span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditGroupModal(prev => ({ ...prev, isOpen: false }))}
                  disabled={editGroupModal.saving}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs bg-purple-100/70 hover:bg-purple-200 dark:bg-white/10 dark:hover:bg-white/20 text-purple-800 dark:text-purple-200 transition-colors"
                >
                  {t('categoryManager.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveRenameGroup}
                  disabled={editGroupModal.saving || !editGroupModal.newName.trim()}
                  className="flex-[2] py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:brightness-105 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25"
                >
                  {editGroupModal.saving ? (
                    <>{t('categoryManager.saving')}</>
                  ) : (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                      {t('categoryManager.saveChanges')}
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
