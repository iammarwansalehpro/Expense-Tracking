import { 
  Receipt, Utensils, ShoppingBag, Shield, Zap, Droplets, Wifi, Smartphone, Home as HomeIcon, 
  Car, Coffee, Ticket, Flame, CarFront, Bus, Cat, Users, Gift, Baby, Heart, Plane, 
  Map, DollarSign, Briefcase, Landmark, Coins, MonitorPlay, Shirt, Plus, Gamepad2, Film, Music,
  GraduationCap, Building2, Send, LineChart, Banknote, Dumbbell, Sparkles, Tag, LayoutGrid,
  PiggyBank, Wallet, CreditCard, Gem, Bitcoin, Scissors, Truck, Monitor, Book, Wrench, 
  Crosshair, Rocket, Umbrella, Anchor, Star, Sun, Moon, Cloud
} from 'lucide-react';
import type { ElementType } from 'react';

export type CategoryTab = 'fixed' | 'lifestyle' | 'income' | 'savings' | 'all';

export interface DBCategory {
  iconName: string;
  color: string;
  textColor: string;
  tab: CategoryTab;
  group: string;
}

export interface CategoryStyle extends DBCategory {
  icon: ElementType;
}

const ICON_MAP: Record<string, ElementType> = {
  Receipt, Utensils, ShoppingBag, Shield, Zap, Droplets, Wifi, Smartphone, Home: HomeIcon, 
  Car, Coffee, Ticket, Flame, CarFront, Bus, Cat, Users, Gift, Baby, Heart, Plane, 
  Map, DollarSign, Briefcase, Landmark, Coins, MonitorPlay, Shirt, Plus, Gamepad2, Film, Music,
  GraduationCap, Building2, Send, LineChart, Banknote, Dumbbell, Sparkles, Tag, LayoutGrid,
  PiggyBank, Wallet, CreditCard, Gem, Bitcoin, Scissors, Truck, Monitor, Book, Wrench, 
  Crosshair, Rocket, Umbrella, Anchor, Star, Sun, Moon, Cloud
};

export const getIconComponent = (name: string): ElementType => {
  return ICON_MAP[name] || Map;
};

// Seed map
export const CATEGORY_SEED: Record<string, DBCategory> = {
  // ค่าใช้จ่ายประจำ
  'บิล': { iconName: 'Receipt', color: 'bg-[#FEF3C7] border-white/50', textColor: 'text-[#D97706]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ' },
  'สมาชิก': { iconName: 'Ticket', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ' },
  'ประกัน': { iconName: 'Shield', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ' },
  'ภาษี': { iconName: 'Receipt', color: 'bg-[#FEF3C7] border-white/50', textColor: 'text-[#D97706]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ' },
  'ค่าไฟ': { iconName: 'Zap', color: 'bg-[#FFEDD5] border-white/50', textColor: 'text-[#C2410C]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ' },
  'ค่าน้ำ': { iconName: 'Droplets', color: 'bg-[#E0E7FF] border-white/50', textColor: 'text-[#4338CA]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ' },
  'อินเทอร์เน็ต': { iconName: 'Wifi', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ' },
  'โทรศัพท์': { iconName: 'Smartphone', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ' },
  'ค่าเช่า': { iconName: 'Home', color: 'bg-[#FFEDD5] border-white/50', textColor: 'text-[#9A3412]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ' },

  // ไลฟ์สไตล์
  'อาหาร': { iconName: 'Utensils', color: 'bg-[#FFEDD5] border-white/50', textColor: 'text-[#C2410C]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'กาแฟ': { iconName: 'Coffee', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'ของใช้': { iconName: 'ShoppingBag', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'ซื้อของ': { iconName: 'ShoppingBag', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'บ้าน': { iconName: 'Home', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'น้ำมัน': { iconName: 'Flame', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'เดินทาง': { iconName: 'Bus', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'จอดรถ': { iconName: 'CarFront', color: 'bg-[#F3F4F6] border-white/50', textColor: 'text-[#374151]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'ท่องเที่ยว': { iconName: 'Plane', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'สัตว์เลี้ยง': { iconName: 'Cat', color: 'bg-[#FFEDD5] border-white/50', textColor: 'text-[#C2410C]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'ครอบครัว': { iconName: 'Users', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'ของขวัญ': { iconName: 'Gift', color: 'bg-[#FFE4E6] border-white/50', textColor: 'text-[#E11D48]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'เด็ก': { iconName: 'Baby', color: 'bg-[#FEF3C7] border-white/50', textColor: 'text-[#D97706]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'บริจาค': { iconName: 'Heart', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'บันเทิง': { iconName: 'MonitorPlay', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'เกม': { iconName: 'Gamepad2', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'หนัง': { iconName: 'Film', color: 'bg-[#FFE4E6] border-white/50', textColor: 'text-[#E11D48]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'เพลง': { iconName: 'Music', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'งาน': { iconName: 'Briefcase', color: 'bg-[#F3F4F6] border-white/50', textColor: 'text-[#374151]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'เรียน': { iconName: 'GraduationCap', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },
  'ออฟฟิศ': { iconName: 'Building2', color: 'bg-[#F3F4F6] border-white/50', textColor: 'text-[#374151]', tab: 'lifestyle', group: 'ไลฟ์สไตล์' },

  // รายรับ
  'เงินเดือน': { iconName: 'Banknote', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'income', group: 'รายรับ' },
  'พาร์ทไทม์': { iconName: 'Briefcase', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'income', group: 'รายรับ' },
  'ฟรีแลนซ์': { iconName: 'Monitor', color: 'bg-[#E0E7FF] border-white/50', textColor: 'text-[#4338CA]', tab: 'income', group: 'รายรับ' },
  'ขายของ': { iconName: 'ShoppingBag', color: 'bg-[#FFEDD5] border-white/50', textColor: 'text-[#C2410C]', tab: 'income', group: 'รายรับ' },
  
  // โบนัสและดอกเบี้ย
  'โบนัส': { iconName: 'Sparkles', color: 'bg-[#FEF3C7] border-white/50', textColor: 'text-[#D97706]', tab: 'income', group: 'โบนัส' },
  'อั่งเปา': { iconName: 'Gift', color: 'bg-[#FFE4E6] border-white/50', textColor: 'text-[#E11D48]', tab: 'income', group: 'โบนัส' },
  'ดอกเบี้ย': { iconName: 'LineChart', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'income', group: 'ดอกเบี้ย' },
  'ปันผล': { iconName: 'Coins', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'income', group: 'ดอกเบี้ย' },
  
  // การลงทุน
  'ขายกองทุน': { iconName: 'Landmark', color: 'bg-[#F3F4F6] border-white/50', textColor: 'text-[#374151]', tab: 'income', group: 'เงินลงทุน' },
  'คริปโต': { iconName: 'Bitcoin', color: 'bg-[#FEF3C7] border-white/50', textColor: 'text-[#D97706]', tab: 'income', group: 'เงินลงทุน' },
  'โอนเงิน': { iconName: 'Send', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'income', group: 'อื่นๆ' },
  'คืนเงิน': { iconName: 'Wallet', color: 'bg-[#E0E7FF] border-white/50', textColor: 'text-[#4338CA]', tab: 'income', group: 'อื่นๆ' },

  // สุขภาพ
  'สุขภาพ': { iconName: 'Heart', color: 'bg-[#FFE4E6] border-white/50', textColor: 'text-[#E11D48]', tab: 'lifestyle', group: 'สุขภาพ' },
  'ฟิตเนส': { iconName: 'Dumbbell', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'สุขภาพ' },
  'ความงาม': { iconName: 'Sparkles', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'สุขภาพ' },

  // อื่นๆ
  'ยังไม่จัดหมวด': { iconName: 'Tag', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'all', group: 'อื่นๆ' },
  'อื่นๆ': { iconName: 'LayoutGrid', color: 'bg-[#FFF9F2] border-white/50', textColor: 'text-[#9CA3AF]', tab: 'all', group: 'อื่นๆ' },
};

// Helper to format DBCategory back to CategoryStyle
export const hydrateCategory = (dbCat: DBCategory): CategoryStyle => {
  return {
    ...dbCat,
    icon: getIconComponent(dbCat.iconName)
  };
};

export const getCategoryStyle = (name: string, appCategories?: Record<string, DBCategory>): CategoryStyle => {
  if (appCategories && appCategories[name]) {
    return hydrateCategory(appCategories[name]);
  }
  if (CATEGORY_SEED[name]) return hydrateCategory(CATEGORY_SEED[name]);
  
  return { 
    icon: Map,
    iconName: 'Map',
    color: 'bg-white/60 border-white/50', 
    textColor: 'text-[#2E1065]', 
    tab: 'all',
    group: 'อื่นๆ'
  };
};

export const getAllCategoriesGrouped = (categories: string[], appCategories?: Record<string, DBCategory>) => {
  // Pre-defined group order
  const groupOrder = [
    'ค่าใช้จ่ายประจำ', 'บิลต่างๆ', 'บ้าน', 'รถ',
    'ไลฟ์สไตล์', 'สุขภาพ', 'การเดินทาง', 'ช้อปปิ้ง',
    'รายรับ', 'โบนัส', 'ดอกเบี้ย', 'เงินลงทุน',
    'เงินออม', 'การเงิน', 'ประกัน',
    'อื่นๆ'
  ];
  
  const groups: Record<string, string[]> = {};
  
  // Initialize with empty arrays to keep order
  groupOrder.forEach(g => {
    groups[g] = [];
  });
  
  categories.forEach(cat => {
    const style = getCategoryStyle(cat, appCategories);
    const groupName = style.group;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(cat);
  });
  
  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });
  
  return groups;
};

export const getCategoriesByType = (type: string) => {
  return Object.keys(CATEGORY_SEED).filter(cat => {
    const style = CATEGORY_SEED[cat];
    if (type === 'income') return style.tab === 'income';
    if (type === 'expense') return style.tab === 'fixed' || style.tab === 'lifestyle' || style.tab === 'all';
    if (type === 'savings') return style.tab === 'savings';
    return false;
  });
};

// Available icons and colors for Admin UI
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
export const AVAILABLE_COLORS = [
  { color: 'bg-[#FEF3C7]', textColor: 'text-[#D97706]', solidColor: 'bg-[#D97706]', name: 'Amber' },
  { color: 'bg-[#EDE9FE]', textColor: 'text-[#6D28D9]', solidColor: 'bg-[#6D28D9]', name: 'Purple' },
  { color: 'bg-[#D1FAE5]', textColor: 'text-[#059669]', solidColor: 'bg-[#059669]', name: 'Emerald' },
  { color: 'bg-[#FFEDD5]', textColor: 'text-[#C2410C]', solidColor: 'bg-[#C2410C]', name: 'Orange' },
  { color: 'bg-[#E0E7FF]', textColor: 'text-[#4338CA]', solidColor: 'bg-[#4338CA]', name: 'Indigo' },
  { color: 'bg-[#F3F4F6]', textColor: 'text-[#374151]', solidColor: 'bg-[#374151]', name: 'Gray' },
  { color: 'bg-[#FFE4E6]', textColor: 'text-[#E11D48]', solidColor: 'bg-[#E11D48]', name: 'Rose' },
  { color: 'bg-[#DBEAFE]', textColor: 'text-[#1D4ED8]', solidColor: 'bg-[#1D4ED8]', name: 'Blue' },
];
