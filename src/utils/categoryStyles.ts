import { 
  Receipt, Utensils, ShoppingBag, Shield, Zap, Droplets, Wifi, Smartphone, Home as HomeIcon, 
  Car, Coffee, Ticket, Flame, CarFront, Bus, Cat, Users, Gift, Baby, Heart, Plane, 
  Map, DollarSign, Briefcase, Landmark, Coins, MonitorPlay, Shirt, Plus, Gamepad2, Film, Music,
  GraduationCap, Building2, Send, LineChart, Banknote, Dumbbell, Sparkles, Tag, LayoutGrid,
  PiggyBank, Wallet, CreditCard, Gem, Bitcoin, Scissors, Truck, Monitor, Book, Wrench, 
  Crosshair, Rocket, Umbrella, Anchor, Star, Sun, Moon, Cloud,
  // Additional world-class icons
  ShoppingBasket, UtensilsCrossed, Apple, Pizza, Cake, Fuel, Train, Bike, Luggage,
  Stethoscope, Pill, Sparkle, Camera, Tv, Headphones, BookOpen, School,
  Award, TrendingUp, HandCoins, ShieldAlert, Key, HeartHandshake,
  Laptop, SmartphoneCharging, Hammer, Dog, Trees, Flower2, CircleDot
} from 'lucide-react';
import type { ElementType } from 'react';

export type CategoryTab = 'fixed' | 'lifestyle' | 'income' | 'savings' | 'all';

export interface DBCategory {
  iconName: string;
  color: string;
  textColor: string;
  tab: CategoryTab;
  group: string;
  isDefault?: boolean;
  isCustom?: boolean;
  hidden?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface CategoryStyle extends DBCategory {
  icon: ElementType;
}

export interface IconCategoryItem {
  name: string;
  label: string;
  icons: string[];
}

export const DEFAULT_EXPENSE_GROUPS: string[] = [
  'ค่าใช้จ่ายประจำ',
  'ไลฟ์สไตล์',
  'การเดินทาง',
  'ช้อปปิ้ง',
  'สุขภาพ',
  'บิลต่างๆ',
  'บ้าน',
  'รถ',
  'การศึกษา',
  'อื่นๆ'
];

export const DEFAULT_INCOME_GROUPS: string[] = [
  'รายรับ',
  'งานพิเศษ',
  'โบนัส',
  'ดอกเบี้ย',
  'เงินลงทุน',
  'ธุรกิจ',
  'อื่นๆ'
];

const ICON_MAP: Record<string, ElementType> = {
  Receipt, Utensils, ShoppingBag, Shield, Zap, Droplets, Wifi, Smartphone, Home: HomeIcon, 
  Car, Coffee, Ticket, Flame, CarFront, Bus, Cat, Users, Gift, Baby, Heart, Plane, 
  Map, DollarSign, Briefcase, Landmark, Coins, MonitorPlay, Shirt, Plus, Gamepad2, Film, Music,
  GraduationCap, Building2, Send, LineChart, Banknote, Dumbbell, Sparkles, Tag, LayoutGrid,
  PiggyBank, Wallet, CreditCard, Gem, Bitcoin, Scissors, Truck, Monitor, Book, Wrench, 
  Crosshair, Rocket, Umbrella, Anchor, Star, Sun, Moon, Cloud,
  // New icons
  ShoppingBasket, UtensilsCrossed, Apple, Pizza, Cake, Fuel, Train, Bike, Luggage,
  Stethoscope, Pill, Sparkle, Camera, Tv, Headphones, BookOpen, School,
  Award, TrendingUp, HandCoins, ShieldAlert, Key, HeartHandshake,
  Laptop, SmartphoneCharging, Hammer, Dog, Trees, Flower2, CircleDot
};

export const ICON_CATEGORIES: IconCategoryItem[] = [
  {
    name: 'food',
    label: 'อาหาร & เครื่องดื่ม',
    icons: ['Utensils', 'UtensilsCrossed', 'Coffee', 'Pizza', 'Apple', 'Cake']
  },
  {
    name: 'transport',
    label: 'การเดินทาง & รถ',
    icons: ['Car', 'CarFront', 'Bus', 'Train', 'Bike', 'Plane', 'Fuel', 'Luggage']
  },
  {
    name: 'shopping',
    label: 'ช้อปปิ้ง & สินค้า',
    icons: ['ShoppingBag', 'ShoppingBasket', 'Shirt', 'Gem', 'Gift', 'Scissors']
  },
  {
    name: 'bills_home',
    label: 'บิล & ที่อยู่อาศัย',
    icons: ['Receipt', 'Home', 'Zap', 'Droplets', 'Wifi', 'Smartphone', 'Building2', 'Key', 'Wrench', 'Hammer']
  },
  {
    name: 'health_wellness',
    label: 'สุขภาพ & ความงาม',
    icons: ['Heart', 'Stethoscope', 'Pill', 'Dumbbell', 'Sparkles', 'Sparkle', 'Shield']
  },
  {
    name: 'entertainment',
    label: 'บันเทิง & พักผ่อน',
    icons: ['Gamepad2', 'Film', 'Music', 'Tv', 'Headphones', 'Camera', 'Ticket', 'MonitorPlay']
  },
  {
    name: 'finance',
    label: 'การเงิน & การลงทุน',
    icons: ['Banknote', 'Coins', 'Wallet', 'PiggyBank', 'CreditCard', 'LineChart', 'TrendingUp', 'Landmark', 'Bitcoin', 'DollarSign', 'HandCoins']
  },
  {
    name: 'work_education',
    label: 'งาน & การศึกษา',
    icons: ['Briefcase', 'GraduationCap', 'Book', 'BookOpen', 'School', 'Laptop', 'Monitor', 'Award', 'Rocket']
  },
  {
    name: 'family_life',
    label: 'ครอบครัว & สัตว์เลี้ยง',
    icons: ['Users', 'Baby', 'Cat', 'Dog', 'HeartHandshake', 'Trees', 'Flower2', 'Star', 'Sun', 'Moon']
  },
  {
    name: 'general',
    label: 'ทั่วไป & อื่นๆ',
    icons: ['Tag', 'LayoutGrid', 'Send', 'CircleDot', 'Umbrella', 'Anchor', 'Crosshair', 'Truck', 'Map']
  }
];

export const getIconComponent = (name: string): ElementType => {
  return ICON_MAP[name] || Map;
};

// Seed map
export const CATEGORY_SEED: Record<string, DBCategory> = {
  // ค่าใช้จ่ายประจำ
  'บิล': { iconName: 'Receipt', color: 'bg-[#FEF3C7] border-white/50', textColor: 'text-[#D97706]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ', isDefault: true },
  'สมาชิก': { iconName: 'Ticket', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ', isDefault: true },
  'ประกัน': { iconName: 'Shield', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ', isDefault: true },
  'ภาษี': { iconName: 'Receipt', color: 'bg-[#FEF3C7] border-white/50', textColor: 'text-[#D97706]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ', isDefault: true },
  'ค่าไฟ': { iconName: 'Zap', color: 'bg-[#FFEDD5] border-white/50', textColor: 'text-[#C2410C]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ', isDefault: true },
  'ค่าน้ำ': { iconName: 'Droplets', color: 'bg-[#E0E7FF] border-white/50', textColor: 'text-[#4338CA]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ', isDefault: true },
  'อินเทอร์เน็ต': { iconName: 'Wifi', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ', isDefault: true },
  'โทรศัพท์': { iconName: 'Smartphone', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ', isDefault: true },
  'ค่าเช่า': { iconName: 'Home', color: 'bg-[#FFEDD5] border-white/50', textColor: 'text-[#9A3412]', tab: 'fixed', group: 'ค่าใช้จ่ายประจำ', isDefault: true },

  // ไลฟ์สไตล์
  'อาหาร': { iconName: 'Utensils', color: 'bg-[#FFEDD5] border-white/50', textColor: 'text-[#C2410C]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'กาแฟ': { iconName: 'Coffee', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'ของใช้': { iconName: 'ShoppingBag', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'ซื้อของ': { iconName: 'ShoppingBag', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'บ้าน': { iconName: 'Home', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'บ้าน', isDefault: true },
  'น้ำมัน': { iconName: 'Flame', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'การเดินทาง', isDefault: true },
  'เดินทาง': { iconName: 'Bus', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'การเดินทาง', isDefault: true },
  'จอดรถ': { iconName: 'CarFront', color: 'bg-[#F3F4F6] border-white/50', textColor: 'text-[#374151]', tab: 'lifestyle', group: 'รถ', isDefault: true },
  'ท่องเที่ยว': { iconName: 'Plane', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'สัตว์เลี้ยง': { iconName: 'Cat', color: 'bg-[#FFEDD5] border-white/50', textColor: 'text-[#C2410C]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'ครอบครัว': { iconName: 'Users', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'ของขวัญ': { iconName: 'Gift', color: 'bg-[#FFE4E6] border-white/50', textColor: 'text-[#E11D48]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'เด็ก': { iconName: 'Baby', color: 'bg-[#FEF3C7] border-white/50', textColor: 'text-[#D97706]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'บริจาค': { iconName: 'Heart', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'บันเทิง': { iconName: 'MonitorPlay', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'เกม': { iconName: 'Gamepad2', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'หนัง': { iconName: 'Film', color: 'bg-[#FFE4E6] border-white/50', textColor: 'text-[#E11D48]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'เพลง': { iconName: 'Music', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'ไลฟ์สไตล์', isDefault: true },
  'งาน': { iconName: 'Briefcase', color: 'bg-[#F3F4F6] border-white/50', textColor: 'text-[#374151]', tab: 'lifestyle', group: 'อื่นๆ', isDefault: true },
  'เรียน': { iconName: 'GraduationCap', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'การศึกษา', isDefault: true },
  'ออฟฟิศ': { iconName: 'Building2', color: 'bg-[#F3F4F6] border-white/50', textColor: 'text-[#374151]', tab: 'lifestyle', group: 'อื่นๆ', isDefault: true },

  // รายรับ
  'เงินเดือน': { iconName: 'Banknote', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'income', group: 'รายรับ', isDefault: true },
  'พาร์ทไทม์': { iconName: 'Briefcase', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'income', group: 'งานพิเศษ', isDefault: true },
  'ฟรีแลนซ์': { iconName: 'Monitor', color: 'bg-[#E0E7FF] border-white/50', textColor: 'text-[#4338CA]', tab: 'income', group: 'งานพิเศษ', isDefault: true },
  'ขายของ': { iconName: 'ShoppingBag', color: 'bg-[#FFEDD5] border-white/50', textColor: 'text-[#C2410C]', tab: 'income', group: 'ธุรกิจ', isDefault: true },
  
  // โบนัสและดอกเบี้ย
  'โบนัส': { iconName: 'Sparkles', color: 'bg-[#FEF3C7] border-white/50', textColor: 'text-[#D97706]', tab: 'income', group: 'โบนัส', isDefault: true },
  'อั่งเปา': { iconName: 'Gift', color: 'bg-[#FFE4E6] border-white/50', textColor: 'text-[#E11D48]', tab: 'income', group: 'โบนัส', isDefault: true },
  'ดอกเบี้ย': { iconName: 'LineChart', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'income', group: 'ดอกเบี้ย', isDefault: true },
  'ปันผล': { iconName: 'Coins', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'income', group: 'เงินลงทุน', isDefault: true },
  
  // การลงทุน
  'ขายกองทุน': { iconName: 'Landmark', color: 'bg-[#F3F4F6] border-white/50', textColor: 'text-[#374151]', tab: 'income', group: 'เงินลงทุน', isDefault: true },
  'คริปโต': { iconName: 'Bitcoin', color: 'bg-[#FEF3C7] border-white/50', textColor: 'text-[#D97706]', tab: 'income', group: 'เงินลงทุน', isDefault: true },
  'โอนเงิน': { iconName: 'Send', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'income', group: 'อื่นๆ', isDefault: true },
  'คืนเงิน': { iconName: 'Wallet', color: 'bg-[#E0E7FF] border-white/50', textColor: 'text-[#4338CA]', tab: 'income', group: 'อื่นๆ', isDefault: true },

  // สุขภาพ
  'สุขภาพ': { iconName: 'Heart', color: 'bg-[#FFE4E6] border-white/50', textColor: 'text-[#E11D48]', tab: 'lifestyle', group: 'สุขภาพ', isDefault: true },
  'ฟิตเนส': { iconName: 'Dumbbell', color: 'bg-[#D1FAE5] border-white/50', textColor: 'text-[#059669]', tab: 'lifestyle', group: 'สุขภาพ', isDefault: true },
  'ความงาม': { iconName: 'Sparkles', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'lifestyle', group: 'สุขภาพ', isDefault: true },

  // อื่นๆ
  'ยังไม่จัดหมวด': { iconName: 'Tag', color: 'bg-[#EDE9FE] border-white/50', textColor: 'text-[#6D28D9]', tab: 'all', group: 'อื่นๆ', isDefault: true },
  'อื่นๆ': { iconName: 'LayoutGrid', color: 'bg-[#FFF9F2] border-white/50', textColor: 'text-[#9CA3AF]', tab: 'all', group: 'อื่นๆ', isDefault: true },
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
    group: 'อื่นๆ',
    isDefault: false
  };
};

export const getAllCategoriesGrouped = (
  categories: string[], 
  appCategories?: Record<string, DBCategory>,
  customGroupOrder?: string[]
) => {
  // Pre-defined group order
  const groupOrder = customGroupOrder && customGroupOrder.length > 0 
    ? [...customGroupOrder, 'อื่นๆ']
    : [
        'ค่าใช้จ่ายประจำ', 'ไลฟ์สไตล์', 'การเดินทาง', 'ช้อปปิ้ง', 'สุขภาพ', 
        'บิลต่างๆ', 'บ้าน', 'รถ', 'การศึกษา',
        'รายรับ', 'งานพิเศษ', 'โบนัส', 'ดอกเบี้ย', 'เงินลงทุน', 'ธุรกิจ',
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
    const groupName = style.group || 'อื่นๆ';
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

// Available icons and colors for UI
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export const AVAILABLE_COLORS = [
  { color: 'bg-[#FFEDD5]', textColor: 'text-[#C2410C]', solidColor: 'bg-[#EA580C]', name: 'Sunset Orange' },
  { color: 'bg-[#FEF3C7]', textColor: 'text-[#D97706]', solidColor: 'bg-[#D97706]', name: 'Amber Gold' },
  { color: 'bg-[#D1FAE5]', textColor: 'text-[#059669]', solidColor: 'bg-[#059669]', name: 'Emerald Mint' },
  { color: 'bg-[#EDE9FE]', textColor: 'text-[#6D28D9]', solidColor: 'bg-[#7C3AED]', name: 'Royal Purple' },
  { color: 'bg-[#E0E7FF]', textColor: 'text-[#4338CA]', solidColor: 'bg-[#4F46E5]', name: 'Deep Indigo' },
  { color: 'bg-[#DBEAFE]', textColor: 'text-[#1D4ED8]', solidColor: 'bg-[#2563EB]', name: 'Ocean Blue' },
  { color: 'bg-[#CFFAFE]', textColor: 'text-[#0E7490]', solidColor: 'bg-[#0891B2]', name: 'Cyan Sky' },
  { color: 'bg-[#CCFBF1]', textColor: 'text-[#0F766E]', solidColor: 'bg-[#0D9488]', name: 'Teal Forest' },
  { color: 'bg-[#FFE4E6]', textColor: 'text-[#E11D48]', solidColor: 'bg-[#E11D48]', name: 'Ruby Rose' },
  { color: 'bg-[#FCE7F3]', textColor: 'text-[#BE185D]', solidColor: 'bg-[#DB2777]', name: 'Pink Blossom' },
  { color: 'bg-[#FAE8FF]', textColor: 'text-[#A21CAF]', solidColor: 'bg-[#C026D3]', name: 'Fuchsia Glow' },
  { color: 'bg-[#ECFCCB]', textColor: 'text-[#4D7C0F]', solidColor: 'bg-[#65A30D]', name: 'Lime Fresh' },
  { color: 'bg-[#FEE2E2]', textColor: 'text-[#B91C1C]', solidColor: 'bg-[#DC2626]', name: 'Crimson Red' },
  { color: 'bg-[#F1F5F9]', textColor: 'text-[#334155]', solidColor: 'bg-[#475569]', name: 'Slate Gray' },
  { color: 'bg-[#FFFBEB]', textColor: 'text-[#B45309]', solidColor: 'bg-[#F59E0B]', name: 'Warm Honey' },
  { color: 'bg-[#E2E8F0]', textColor: 'text-[#1E293B]', solidColor: 'bg-[#334155]', name: 'Midnight Charcoal' },
];
