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

export const ICON_CATEGORY_EN_LABELS: Record<string, string> = {
  food: 'Food & Drink',
  transport: 'Transport & Auto',
  shopping: 'Shopping & Goods',
  bills_home: 'Bills & Housing',
  health_wellness: 'Health & Beauty',
  entertainment: 'Entertainment',
  finance: 'Finance & Invest',
  work_education: 'Work & Study',
  family_life: 'Family & Pets',
  general: 'General & Others',
};

export const DEFAULT_CATEGORY_EN_NAMES: Record<string, string> = {
  'บิล': 'Bills',
  'สมาชิก': 'Subscriptions',
  'ประกัน': 'Insurance',
  'ภาษี': 'Taxes',
  'ค่าไฟ': 'Electricity',
  'ค่าน้ำ': 'Water',
  'อินเทอร์เน็ต': 'Internet',
  'โทรศัพท์': 'Phone',
  'ค่าเช่า': 'Rent',
  'อาหาร': 'Food & Dining',
  'กาแฟ': 'Coffee & Drinks',
  'ของใช้': 'Groceries',
  'ซื้อของ': 'Shopping',
  'บ้าน': 'Housing',
  'น้ำมัน': 'Fuel',
  'เดินทาง': 'Transportation',
  'จอดรถ': 'Parking',
  'ท่องเที่ยว': 'Travel',
  'สัตว์เลี้ยง': 'Pets',
  'ครอบครัว': 'Family',
  'ของขวัญ': 'Gifts',
  'เด็ก': 'Baby & Kids',
  'บริจาค': 'Donations',
  'บันเทิง': 'Entertainment',
  'เกม': 'Gaming',
  'หนัง': 'Movies',
  'เพลง': 'Music',
  'งาน': 'Work',
  'เรียน': 'Education',
  'ออฟฟิศ': 'Office',
  'เงินเดือน': 'Salary',
  'พาร์ทไทม์': 'Part-time',
  'ฟรีแลนซ์': 'Freelance',
  'ขายของ': 'Sales',
  'โบนัส': 'Bonus',
  'อั่งเปา': 'Red Envelope',
  'ดอกเบี้ย': 'Interest',
  'ปันผล': 'Dividends',
  'ขายกองทุน': 'Mutual Funds',
  'คริปโต': 'Crypto',
  'โอนเงิน': 'Transfer',
  'คืนเงิน': 'Refund',
  'สุขภาพ': 'Health & Medical',
  'ฟิตเนส': 'Fitness',
  'ความงาม': 'Beauty',
  'ยังไม่จัดหมวด': 'Uncategorized',
  'อื่นๆ': 'Other'
};

export const DEFAULT_GROUP_EN_NAMES: Record<string, string> = {
  'ค่าใช้จ่ายประจำ': 'Fixed Expenses',
  'ไลฟ์สไตล์': 'Lifestyle',
  'การเดินทาง': 'Transportation',
  'ช้อปปิ้ง': 'Shopping',
  'สุขภาพ': 'Health & Wellness',
  'บิลต่างๆ': 'Bills & Utilities',
  'บ้าน': 'Home & Living',
  'รถ': 'Vehicle',
  'การศึกษา': 'Education',
  'รายรับ': 'Income',
  'งานพิเศษ': 'Side Hustle',
  'โบนัส': 'Bonus',
  'ดอกเบี้ย': 'Interest',
  'เงินลงทุน': 'Investments',
  'ธุรกิจ': 'Business',
  'เงินออม': 'Savings',
  'การเงิน': 'Finance',
  'ประกัน': 'Insurance',
  'อื่นๆ': 'Other',
  'หมวดหมู่ที่ใช้บ่อย (Favorites)': 'Favorites',
};

export const getCategoryDisplayName = (name: string, language?: string): string => {
  if (language === 'en' && DEFAULT_CATEGORY_EN_NAMES[name]) {
    return DEFAULT_CATEGORY_EN_NAMES[name];
  }
  return name;
};

export const getGroupDisplayName = (groupName: string, language?: string): string => {
  if (language === 'en' && DEFAULT_GROUP_EN_NAMES[groupName]) {
    return DEFAULT_GROUP_EN_NAMES[groupName];
  }
  return groupName;
};

export const getIconCategoryLabel = (cat: IconCategoryItem, language?: string): string => {
  if (language === 'en' && ICON_CATEGORY_EN_LABELS[cat.name]) {
    return ICON_CATEGORY_EN_LABELS[cat.name];
  }
  return cat.label;
};

export const ICON_KEYWORDS: Record<string, string[]> = {
  Receipt: ['receipt', 'bill', 'invoice', 'paper', 'tax', 'statement', 'payment', 'slip', 'บิล', 'ใบเสร็จ', 'ใบแจ้งหนี้', 'ค่าน้ำค่าไฟ', 'สลิป', 'ชำระเงิน', 'ภาษี', 'เอกสาร'],
  Utensils: ['utensils', 'food', 'restaurant', 'eat', 'dinner', 'lunch', 'fork', 'spoon', 'knife', 'meal', 'dish', 'dining', 'อาหาร', 'กินข้าว', 'ร้านอาหาร', 'ข้าว', 'มื้ออาหาร', 'จาน', 'ช้อน', 'ส้อม', 'มีด', 'ของกิน', 'บุฟเฟต์', 'ทานข้าว', 'กับข้าว'],
  UtensilsCrossed: ['utensils', 'food', 'restaurant', 'fork', 'knife', 'cook', 'chef', 'kitchen', 'อาหาร', 'กินข้าว', 'ร้านอาหาร', 'มีดส้อม', 'ทำอาหาร', 'เชฟ', 'ครัว', 'ภัตตาคาร'],
  ShoppingBag: ['shopping', 'bag', 'store', 'market', 'mall', 'buy', 'retail', 'goods', 'groceries', 'ช้อปปิ้ง', 'ซื้อของ', 'ถุงช้อปปิ้ง', 'ตลาด', 'ห้าง', 'ซูเปอร์มาร์เก็ต', 'ของใช้', 'ร้านค้า', 'ซื้อ'],
  ShoppingBasket: ['basket', 'shopping', 'supermarket', 'groceries', 'store', 'ตะกร้า', 'ช้อปปิ้ง', 'ซื้อของ', 'ของสด', 'ตลาด', 'ซูเปอร์มาร์เก็ต'],
  Shield: ['shield', 'security', 'insurance', 'safety', 'protect', 'protection', 'guard', 'ประกัน', 'ประกันชีวิต', 'ประกันภัย', 'ความปลอดภัย', 'คุ้มครอง', 'ป้องกัน', 'เกราะ'],
  ShieldAlert: ['shield', 'alert', 'warning', 'emergency', 'security', 'risk', 'danger', 'ประกันภัย', 'ฉุกเฉิน', 'เตือนภัย', 'ความเสี่ยง', 'ระวัง'],
  Zap: ['zap', 'electricity', 'power', 'energy', 'flash', 'lightning', 'electric', 'charge', 'ค่าไฟ', 'ไฟฟ้า', 'พลังงาน', 'ไฟ', 'สายฟ้า', 'บิลค่าไฟ', 'ชาร์จไฟ'],
  Droplets: ['droplets', 'water', 'aqua', 'rain', 'liquid', 'water bill', 'ค่าน้ำ', 'น้ำ', 'ประปา', 'น้ำดื่ม', 'บิลค่าน้ำ', 'หยดน้ำ', 'ของเหลว'],
  Wifi: ['wifi', 'internet', 'network', 'wireless', 'broadband', 'connection', 'online', 'ไวไฟ', 'อินเทอร์เน็ต', 'เน็ต', 'สัญญาณ', 'เน็ตบ้าน', 'เครือข่าย', 'ออนไลน์'],
  Smartphone: ['smartphone', 'phone', 'mobile', 'call', 'cellphone', 'device', 'app', 'iphone', 'โทรศัพท์', 'มือถือ', 'สมาร์ตโฟน', 'ค่าโทร', 'เติมเงิน', 'เน็ตมือถือ', 'ไอโฟน', 'ซิม'],
  SmartphoneCharging: ['charging', 'battery', 'plug', 'phone', 'power', 'ชาร์จแบต', 'ชาร์จมือถือ', 'แบตเตอรี่', 'สายชาร์จ', 'พาวเวอร์แบงค์'],
  Home: ['home', 'house', 'living', 'building', 'rent', 'mortgage', 'residence', 'apartment', 'condo', 'บ้าน', 'ที่พัก', 'ห้องพัก', 'คอนโด', 'อพาร์ทเมนท์', 'ค่าเช่า', 'ผ่อนบ้าน', 'ที่อยู่อาศัย', 'หอพัก'],
  Building2: ['building', 'office', 'company', 'work', 'property', 'real estate', 'ตึก', 'อาคาร', 'สำนักงาน', 'ออฟฟิศ', 'บริษัท', 'อสังหา', 'ที่ทำงาน'],
  Car: ['car', 'vehicle', 'auto', 'automobile', 'drive', 'driving', 'road', 'traffic', 'taxi', 'ride', 'รถ', 'รถยนต์', 'ยานพาหนะ', 'ขับรถ', 'เดินทาง', 'แท็กซี่', 'ค่าน้ำมัน', 'ทางด่วน', 'ผ่อนรถ'],
  CarFront: ['car', 'front', 'vehicle', 'auto', 'drive', 'parking', 'รถ', 'รถยนต์', 'หน้ารถ', 'จอดรถ', 'ค่าจอดรถ'],
  Fuel: ['fuel', 'gas', 'gasoline', 'petrol', 'oil', 'energy', 'station', 'น้ำมัน', 'ปั๊มน้ำมัน', 'เติมน้ำมัน', 'แก๊ส', 'เชื้อเพลิง'],
  Bus: ['bus', 'transit', 'transport', 'public transport', 'coach', 'commute', 'รถเมล์', 'รถบัส', 'รถโดยสาร', 'การเดินทาง', 'ขนส่งสาธารณะ', 'สองแถว'],
  Train: ['train', 'metro', 'subway', 'bts', 'mrt', 'railway', 'commute', 'รถไฟ', 'รถไฟฟ้า', 'บีทีเอส', 'เอ็มอาร์ที', 'bts', 'mrt', 'แอร์พอร์ตลิงก์', 'เดินทาง'],
  Bike: ['bike', 'bicycle', 'cycling', 'motorcycle', 'ride', 'จักรยาน', 'มอเตอร์ไซค์', 'ปั่นจักรยาน', 'ขับขี่', 'สองล้อ', 'วินมอไซ'],
  Plane: ['plane', 'airplane', 'flight', 'travel', 'trip', 'airport', 'vacation', 'holiday', 'tourism', 'เครื่องบิน', 'บิน', 'ตั๋วเครื่องบิน', 'เที่ยว', 'ท่องเที่ยว', 'สนามบิน', 'ทริป', 'ต่างประเทศ', 'พักผ่อน'],
  Luggage: ['luggage', 'baggage', 'suitcase', 'travel', 'trip', 'กระเป๋าเดินทาง', 'สัมภาระ', 'ท่องเที่ยว', 'เดินทาง', 'ทัวร์'],
  Coffee: ['coffee', 'cafe', 'tea', 'cup', 'drink', 'beverage', 'starbucks', 'latte', 'espresso', 'cappuccino', 'break', 'กาแฟ', 'คาเฟ่', 'ชา', 'เครื่องดื่ม', 'แก้ว', 'น้ำ', 'ชานม', 'พักเบรก', 'ลาเต้', 'เอสเพรสโซ', 'อเมซอน', 'สตาร์บัคส์'],
  Apple: ['apple', 'fruit', 'healthy', 'food', 'snack', 'แอปเปิ้ล', 'ผลไม้', 'ของกิน', 'สุขภาพ', 'อาหารคลีน'],
  Pizza: ['pizza', 'fastfood', 'junk food', 'food', 'italian', 'delivery', 'พิซซ่า', 'ฟาสต์ฟู้ด', 'อาหารขยะ', 'เดลิเวอรี่', 'อาหาร'],
  Cake: ['cake', 'dessert', 'bakery', 'sweet', 'birthday', 'party', 'snack', 'เค้ก', 'ขนม', 'เบเกอรี่', 'ของหวาน', 'วันเกิด', 'งานเลี้ยง', 'ของทานเล่น'],
  Ticket: ['ticket', 'pass', 'movie', 'concert', 'event', 'subscription', 'ตั๋ว', 'บัตร', 'ตั๋วหนัง', 'คอนเสิร์ต', 'บัตรสมาชิก', 'อีเวนต์'],
  Flame: ['flame', 'fire', 'gas', 'hot', 'energy', 'fuel', 'burn', 'ไฟ', 'แก๊ส', 'เปลวไฟ', 'ค่าแก๊ส', 'พลังงาน', 'เผาผลาญ'],
  Cat: ['cat', 'pet', 'animal', 'kitten', 'meow', 'veterinary', 'pet food', 'แมว', 'สัตว์เลี้ยง', 'อาหารแมว', 'ทาสแมว', 'ลูกแมว', 'รักษาสัตว์'],
  Dog: ['dog', 'pet', 'animal', 'puppy', 'bark', 'veterinary', 'pet food', 'หมา', 'สุนัข', 'สัตว์เลี้ยง', 'อาหารหมา', 'ลูกหมา', 'รักษาสัตว์'],
  Users: ['users', 'family', 'people', 'friends', 'group', 'community', 'social', 'ครอบครัว', 'คน', 'เพื่อน', 'กลุ่ม', 'ชุมชน', 'สังคม', 'ผู้ใช้งาน'],
  Baby: ['baby', 'child', 'kid', 'toddler', 'infant', 'parenting', 'เด็ก', 'ลูก', 'ทารก', 'ของใช้เด็ก', 'นมผง', 'แพมเพิส', 'ค่าเทอม'],
  Gift: ['gift', 'present', 'birthday', 'celebration', 'angpao', 'bonus', 'holiday', 'ของขวัญ', 'ของฝาก', 'วันเกิด', 'ปีใหม่', 'อั่งเปา', 'โบนัส', 'ให้เงิน', 'งานแต่ง'],
  Heart: ['heart', 'love', 'health', 'care', 'medical', 'hospital', 'charity', 'donation', 'wellness', 'หัวใจ', 'ความรัก', 'สุขภาพ', 'โรงพยาบาล', 'การแพทย์', 'ดูแล', 'บริจาค', 'ทำบุญ', 'ประกันสุขภาพ'],
  HeartHandshake: ['handshake', 'partnership', 'deal', 'agreement', 'charity', 'help', 'trust', 'ความช่วยเหลือ', 'การกุศล', 'จับมือ', 'ข้อตกลง', 'มิตรภาพ', 'บริจาค'],
  Stethoscope: ['stethoscope', 'doctor', 'medical', 'hospital', 'clinic', 'checkup', 'health', 'หมอ', 'แพทย์', 'โรงพยาบาล', 'คลินิก', 'ตรวจสุขภาพ', 'สุขภาพ', 'รักษา'],
  Pill: ['pill', 'medicine', 'drug', 'pharmacy', 'supplement', 'vitamin', 'treatment', 'ยา', 'ค่ายา', 'วิตามิน', 'อาหารเสริม', 'ร้านขายยา', 'รักษาโรค'],
  Dumbbell: ['dumbbell', 'fitness', 'gym', 'workout', 'exercise', 'sport', 'muscle', 'training', 'ดัมเบล', 'ฟิตเนส', 'ยิม', 'ออกกำลังกาย', 'กีฬา', 'กล้าม', 'เทรนเนอร์'],
  Sparkles: ['sparkles', 'beauty', 'magic', 'clean', 'bonus', 'special', 'shine', 'glow', 'star', 'ความงาม', 'สวยงาม', 'พิเศษ', 'โบนัส', 'วิ้งค์', 'ทำความสะอาด', 'เครื่องสำอาง', 'คลินิกเสริมความงาม'],
  Sparkle: ['sparkle', 'shine', 'star', 'clean', 'new', 'beauty', 'ประกาย', 'เงางาม', 'ดาว', 'ใหม่', 'ความสวยงาม'],
  Gamepad2: ['game', 'gamepad', 'gaming', 'play', 'playstation', 'nintendo', 'steam', 'xbox', 'entertainment', 'เกม', 'จอยเกม', 'เล่นเกม', 'เติมเกม', 'สตรีม', 'เพลย์สเตชั่น', 'ความบันเทิง'],
  Film: ['film', 'movie', 'cinema', 'theater', 'netflix', 'video', 'show', 'หนัง', 'ภาพยนตร์', 'โรงหนัง', 'ดูหนัง', 'เน็ตฟลิกซ์', 'เน็ตฟลิก', 'ตั๋วหนัง'],
  Music: ['music', 'song', 'audio', 'sound', 'spotify', 'concert', 'listen', 'เพลง', 'ดนตรี', 'เสียง', 'สปอติฟาย', 'คอนเสิร์ต', 'ฟังเพลง'],
  Headphones: ['headphones', 'headset', 'audio', 'music', 'podcast', 'listen', 'หูฟัง', 'ฟังเพลง', 'พอดแคสต์', 'เสียง'],
  Tv: ['tv', 'television', 'screen', 'display', 'show', 'broadcast', 'ทีวี', 'โทรทัศน์', 'จอภาพ', 'รายการ'],
  Camera: ['camera', 'photo', 'photography', 'picture', 'video', 'shoot', 'กล้อง', 'ถ่ายรูป', 'ถ่ายภาพ', 'รูปถ่าย', 'ภาพถ่าย'],
  Banknote: ['banknote', 'money', 'cash', 'salary', 'income', 'pay', 'currency', 'ธนบัตร', 'เงิน', 'เงินสด', 'เงินเดือน', 'รายรับ', 'จ่ายเงิน', 'แบงก์'],
  Coins: ['coins', 'change', 'money', 'cash', 'dividend', 'เหรียญ', 'เงินทอน', 'เศษเงิน', 'เงินปันผล', 'เงินสะสม'],
  Wallet: ['wallet', 'money', 'purse', 'cash', 'pocket', 'กระเป๋าตังค์', 'กระเป๋าเงิน', 'เงินสด', 'เก็บเงิน'],
  PiggyBank: ['piggy bank', 'save', 'saving', 'savings', 'deposit', 'money', 'กระปุกออมสิน', 'ออมเงิน', 'เงินออม', 'ฝากเงิน', 'หยอดกระปุก'],
  CreditCard: ['credit card', 'debit card', 'card', 'payment', 'visa', 'mastercard', 'บัตรเครดิต', 'บัตรเดบิต', 'รูดบัตร', 'ผ่อนชำระ', 'การชำระเงิน'],
  DollarSign: ['dollar', 'money', 'currency', 'finance', 'usd', 'ดอลลาร์', 'เงิน', 'การเงิน', 'สกุลเงิน'],
  HandCoins: ['coins', 'hand', 'allowance', 'tip', 'charity', 'give', 'receive', 'เงินเดือน', 'ค่าขนม', 'ทิป', 'ให้เงิน', 'รับเงิน', 'เบี้ยเลี้ยง'],
  Landmark: ['landmark', 'bank', 'government', 'tax', 'institution', 'finance', 'ธนาคาร', 'รัฐบาล', 'ภาษี', 'สถาบันการเงิน', 'สถานที่'],
  LineChart: ['chart', 'graph', 'stocks', 'trading', 'investment', 'finance', 'growth', 'กราฟ', 'หุ้น', 'เทรด', 'การลงทุน', 'ดอกเบี้ย', 'ผลตอบแทน', 'การเงิน'],
  TrendingUp: ['trend', 'growth', 'profit', 'stocks', 'bullish', 'increase', 'กำไร', 'เติบโต', 'หุ้นขึ้น', 'ขาขึ้น', 'รายได้เพิ่ม'],
  Bitcoin: ['bitcoin', 'crypto', 'cryptocurrency', 'btc', 'blockchain', 'บิตคอยน์', 'คริปโต', 'เหรียญดิจิทัล', 'บล็อกเชน'],
  Gem: ['gem', 'diamond', 'jewelry', 'luxury', 'precious', 'stone', 'เพชร', 'พลอย', 'อัญมณี', 'เครื่องประดับ', 'หรูหรา'],
  Briefcase: ['briefcase', 'work', 'job', 'business', 'office', 'career', 'profession', 'งาน', 'ทำงาน', 'ธุรกิจ', 'ออฟฟิศ', 'อาชีพ', 'กระเป๋าเอกสาร'],
  Laptop: ['laptop', 'computer', 'macbook', 'work', 'tech', 'device', 'แล็ปท็อป', 'โน้ตบุ๊ก', 'คอมพิวเตอร์', 'ทำงาน', 'อุปกรณ์ไอที'],
  Monitor: ['monitor', 'screen', 'desktop', 'computer', 'freelance', 'tech', 'จอคอม', 'หน้าจอ', 'คอมพิวเตอร์', 'ฟรีแลนซ์', 'ไอที'],
  GraduationCap: ['graduation', 'cap', 'degree', 'education', 'university', 'study', 'หมวกรับปริญญา', 'รับปริญญา', 'การศึกษา', 'มหาวิทยาลัย', 'เรียนจบ'],
  Book: ['book', 'read', 'reading', 'study', 'learn', 'library', 'หนังสือ', 'อ่านหนังสือ', 'เรียน', 'ตำรา', 'ห้องสมุด'],
  BookOpen: ['book', 'open', 'study', 'education', 'learn', 'knowledge', 'หนังสือ', 'เปิดอ่าน', 'เรียนรู้', 'ความรู้', 'วิชาการ'],
  School: ['school', 'education', 'tuition', 'study', 'class', 'โรงเรียน', 'การศึกษา', 'ค่าเทอม', 'ห้องเรียน', 'นักเรียน'],
  Award: ['award', 'trophy', 'prize', 'winner', 'achievement', 'success', 'รางวัล', 'ถ้วยรางวัล', 'ชนะเลิศ', 'ความสำเร็จ', 'ผลงาน'],
  Rocket: ['rocket', 'startup', 'launch', 'fast', 'growth', 'future', 'จรวด', 'สตาร์ทอัพ', 'เปิดตัว', 'เติบโตรวดเร็ว', 'อนาคต'],
  Shirt: ['shirt', 'clothes', 'clothing', 'fashion', 'apparel', 'wear', 'เสื้อ', 'เสื้อผ้า', 'แฟชั่น', 'แต่งตัว', 'เครื่องแต่งกาย'],
  Scissors: ['scissors', 'cut', 'haircut', 'salon', 'barber', 'craft', 'กรรไกร', 'ตัดผม', 'ซาลอน', 'ร้านตัดผม', 'งานฝีมือ'],
  Wrench: ['wrench', 'tool', 'repair', 'maintenance', 'fix', 'hardware', 'ประแจ', 'เครื่องมือ', 'ซ่อมแซม', 'บำรุงรักษา', 'ซ่อมรถ', 'ซ่อมบ้าน'],
  Hammer: ['hammer', 'tool', 'build', 'construction', 'repair', 'fix', 'ค้อน', 'เครื่องมือช่าง', 'ก่อสร้าง', 'ซ่อมแซม', 'งานช่าง'],
  Key: ['key', 'lock', 'access', 'door', 'home', 'car key', 'กุญแจ', 'ไขประตู', 'ลูกกุญแจ', 'กุญแจรถ', 'กุญแจบ้าน'],
  Tag: ['tag', 'price', 'label', 'category', 'discount', 'sale', 'แท็ก', 'ป้ายราคา', 'หมวดหมู่', 'ส่วนลด', 'ป้าย'],
  LayoutGrid: ['grid', 'layout', 'apps', 'all', 'category', 'more', 'ตาราง', 'ทั้งหมด', 'เมนู', 'หมวดหมู่อื่นๆ'],
  Plus: ['plus', 'add', 'create', 'new', 'บวก', 'เพิ่ม', 'สร้างใหม่'],
  Send: ['send', 'transfer', 'share', 'message', 'paper plane', 'ส่งเงิน', 'โอนเงิน', 'ส่งข้อความ', 'เครื่องบินกระดาษ'],
  Truck: ['truck', 'delivery', 'shipping', 'transport', 'cargo', 'move', 'รถบรรทุก', 'ส่งของ', 'เดลิเวอรี่', 'ขนส่ง', 'พัสดุ', 'ย้ายบ้าน'],
  Map: ['map', 'location', 'travel', 'gps', 'direction', 'place', 'แผนที่', 'ตำแหน่ง', 'นำทาง', 'ท่องเที่ยว', 'สถานที่'],
  Umbrella: ['umbrella', 'rain', 'weather', 'protect', 'insurance', 'ร่ม', 'กันฝน', 'สภาพอากาศ', 'ป้องกัน', 'คุ้มครอง'],
  Anchor: ['anchor', 'sea', 'boat', 'ship', 'marine', 'harbor', 'สมอเรือ', 'ทะเล', 'เรือ', 'ท่าเรือ', 'ชายหาด'],
  Crosshair: ['crosshair', 'target', 'goal', 'focus', 'aim', 'เป้าหมาย', 'โฟกัส', 'เล็ง', 'ตั้งเป้า'],
  Star: ['star', 'favorite', 'rating', 'special', 'best', 'ดาว', 'ชื่นชอบ', 'พิเศษ', 'เรตติ้ง', 'ดีเยี่ยม'],
  Sun: ['sun', 'day', 'summer', 'weather', 'light', 'bright', 'พระอาทิตย์', 'กลางวัน', 'แดด', 'หน้าร้อน', 'สว่าง'],
  Moon: ['moon', 'night', 'sleep', 'dark', 'evening', 'พระจันทร์', 'กลางคืน', 'นอนหลับ', 'มืด', 'ค่ำ'],
  Cloud: ['cloud', 'weather', 'sky', 'rain', 'cloud storage', 'เมฆ', 'ก้อนเมฆ', 'สภาพอากาศ', 'ฝน', 'คลาวด์'],
  Trees: ['trees', 'tree', 'forest', 'nature', 'garden', 'park', 'green', 'ต้นไม้', 'ป่า', 'ธรรมชาติ', 'สวน', 'สิ่งแวดล้อม', 'พื้นที่สีเขียว'],
  Flower2: ['flower', 'nature', 'garden', 'plant', 'bloom', 'beauty', 'ดอกไม้', 'ธรรมชาติ', 'สวนดอกไม้', 'จัดสวน', 'ความสดใส'],
  CircleDot: ['circle', 'dot', 'point', 'record', 'target', 'วงกลม', 'จุด', 'บันทึก', 'ทั่วไป'],
};

export const matchIconSearch = (iconName: string, query: string): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  if (iconName.toLowerCase().includes(q)) return true;
  
  const keywords = ICON_KEYWORDS[iconName];
  if (keywords) {
    return keywords.some(k => k.toLowerCase().includes(q));
  }
  return false;
};

// Rich Category Synonyms for intelligent natural language & bilingual search
export const CATEGORY_SEARCH_SYNONYMS: Record<string, string[]> = {
  'อาหาร': [
    'food', 'dining', 'eat', 'restaurant', 'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'rice', 'noodle',
    'fastfood', 'bakery', 'dessert', 'buffet', 'shabu', 'mookata', 'delivery', 'lineman', 'grabfood', 'foodpanda',
    'robinhood', 'shopeefood', 'kfc', 'mcdonalds', 'mcdonald', 'pizza', 'burger', 'ข้าว', 'กินข้าว', 'ร้านอาหาร',
    'มื้ออาหาร', 'มื้อเย็น', 'มื้อเช้า', 'มื้อเที่ยง', 'ก๋วยเตี๋ยว', 'บุฟเฟต์', 'บุฟเฟ่ต์', 'หมูกระทะ', 'ชาบู',
    'เดลิเวอรี่', 'ทานข้าว', 'กับข้าว', 'ของกิน', 'ตามสั่ง', 'อาหารคลีน', 'ของกินเล่น', 'ขนม', 'สเต็ก', 'ส้มตำ'
  ],
  'กาแฟ': [
    'coffee', 'cafe', 'tea', 'starbucks', 'amazon', 'cafe amazon', 'drink', 'drinks', 'beverage', 'boba',
    'bubble tea', 'latte', 'espresso', 'cappuccino', 'americano', 'matcha', 'cocoa', 'smoothie', 'ชา', 'ชานม',
    'ชาไข่มุก', 'คาเฟ่', 'สตาร์บัคส์', 'อเมซอน', 'ชาตรามือ', 'กาแฟสด', 'เครื่องดื่ม', 'น้ำชง', 'โกโก้', 'สมูทตี้',
    'มัทฉะ', 'น้ำหวาน', 'น้ำผลไม้', 'กาแฟโบราณ', 'โอเลี้ยง'
  ],
  'ของใช้': [
    'groceries', 'grocery', 'supermarket', 'market', 'daily', 'household', '7-11', '7-eleven', 'seven', 'lotus',
    'big c', 'tops', 'gourmet', 'cj', 'cj express', 'villa market', 'makro', 'แม็คโคร', 'โลตัส', 'บิ๊กซี', 'ท็อปส์',
    'เซเว่น', 'ของใช้ในบ้าน', 'ของสด', 'ตลาดสด', 'ซูเปอร์มาร์เก็ต', 'สบู่', 'ยาสระผม', 'ผงซักฟอก', 'กระดาษทิชชู่',
    'ทิชชู่', 'ของชำ', 'น้ำยาล้างจาน', 'ยาสีฟัน', 'ของใช้ส่วนตัว'
  ],
  'ซื้อของ': [
    'shopping', 'shop', 'buy', 'store', 'mall', 'lazada', 'shopee', 'tiktok', 'tiktok shop', 'clothes', 'clothing',
    'fashion', 'shoes', 'bag', 'cosmetics', 'เครื่องสำอาง', 'เสื้อผ้า', 'แฟชั่น', 'ช้อปปิ้ง', 'ซื้อของออนไลน์',
    'ห้างสรรพสินค้า', 'ลาซาด้า', 'ช้อปปี้', 'รองเท้า', 'กระเป๋า', 'กางเกง', 'เดรส', 'เครื่องประดับ', 'สั่งของ',
    'พัสดุ', 'เก็บเงินปลายทาง'
  ],
  'เดินทาง': [
    'transport', 'transportation', 'commute', 'travel', 'transit', 'bus', 'train', 'metro', 'subway', 'bts', 'mrt',
    'airport rail link', 'arl', 'taxi', 'grab', 'bolt', 'lineman taxi', 'maxme', 'van', 'boat', 'เรือ', 'รถตู้',
    'รถเมล์', 'รถไฟฟ้า', 'บีทีเอส', 'เอ็มอาร์ที', 'แท็กซี่', 'แกร็บ', 'โบลท์', 'วิน', 'วินมอไซ', 'มอไซค์', 'ค่ารถ',
    'ค่าเดินทาง', 'สองแถว', 'ตั๋วรถ', 'ตั๋วเครื่องบิน', 'สายการบิน', 'flight', 'airline', 'airasia', 'nokair',
    'vietjet', 'lionair', 'การบินไทย', 'เดินทาง', 'ขนส่ง'
  ],
  'น้ำมัน': [
    'fuel', 'gas', 'gasoline', 'petrol', 'oil', 'diesel', 'ptt', 'bcp', 'bangchak', 'shell', 'caltex', 'esso',
    'susco', 'ปั๊ม', 'ปั๊มน้ำมัน', 'ปตท', 'บางจาก', 'เชลล์', 'คาลเท็กซ์', 'เอสโซ่', 'เติมน้ำมัน', 'แก๊ส', 'ดีเซล',
    'เบนซิน', 'แก๊สโซฮอล์', 'lpg', 'ngv', 'ev', 'ชาร์จไฟรถ', 'ev charging', 'ค่าน้ำมัน'
  ],
  'จอดรถ': [
    'parking', 'park', 'car park', 'parking fee', 'valet', 'toll', 'tollway', 'expressway', 'easypass', 'm-flow',
    'mflow', 'ค่าจอด', 'ที่จอดรถ', 'ค่าจอดรถ', 'บัตรจอดรถ', 'ทางด่วน', 'ด่านทางด่วน', 'ค่าผ่านทาง'
  ],
  'ค่าไฟ': [
    'electricity', 'electric', 'power', 'mea', 'pea', 'egat', 'electric bill', 'ไฟ', 'ไฟฟ้า', 'การไฟฟ้า', 'กฟน',
    'กฟภ', 'บิลค่าไฟ', 'ค่าไฟฟ้า', 'พลังงาน'
  ],
  'ค่าน้ำ': [
    'water', 'water bill', 'mwa', 'pwa', 'plumbing', 'น้ำ', 'ประปา', 'การประปา', 'กปน', 'กปภ', 'บิลค่าน้ำ', 'ค่าน้ำประปา'
  ],
  'อินเทอร์เน็ต': [
    'internet', 'wifi', 'broadband', 'fiber', 'ais fibre', 'true online', '3bb', 'nt', 'เน็ต', 'เน็ตบ้าน', 'ไวไฟ',
    'อินเตอร์เน็ต', 'เราเตอร์', 'ไฟเบอร์', 'ค่าเน็ต'
  ],
  'โทรศัพท์': [
    'phone', 'mobile', 'cellphone', 'bill', 'topup', 'refill', 'ais', 'true', 'truemove', 'dtac', 'mybynt', 'ค่าโทร',
    'ค่าเน็ตมือถือ', 'เติมเงิน', 'ซิม', 'รายเดือน', 'โทรศัพท์มือถือ', 'สมาร์ทโฟน', 'บิลโทรศัพท์'
  ],
  'ค่าเช่า': [
    'rent', 'rental', 'lease', 'apartment', 'condo', 'dorm', 'dormitory', 'room', 'hostel', 'room rent', 'ค่าเช่า',
    'ค่าเช่าห้อง', 'ค่าเช่าบ้าน', 'ค่าเช่าคอนโด', 'หอพัก', 'ค่าหอ', 'อพาร์ทเมนท์', 'ค่าส่วนกลาง', 'นิติบุคคล', 'ผ่อนบ้าน'
  ],
  'บ้าน': [
    'home', 'house', 'living', 'furniture', 'home repair', 'homepro', 'ikea', 'index', 'thaiwatsadu', 'do home',
    'โฮมโปร', 'อิเกีย', 'อินเด็กซ์', 'ไทวัสดุ', 'ดูโฮม', 'แต่งบ้าน', 'ซ่อมบ้าน', 'อุปกรณ์บ้าน', 'เครื่องใช้ไฟฟ้า',
    'หลอดไฟ', 'เฟอร์นิเจอร์', 'ที่อยู่อาศัย'
  ],
  'สมาชิก': [
    'subscription', 'subs', 'netflix', 'youtube', 'spotify', 'disney', 'disney+', 'apple', 'icloud', 'prime',
    'amazon prime', 'chatgpt', 'openai', 'midjourney', 'google one', 'canva', 'playstation plus', 'xbox game pass',
    'เน็ตฟลิกซ์', 'เน็ตฟลิก', 'ยูทูป', 'สปอติฟาย', 'ดิสนีย์', 'แอปเปิ้ล', 'ไอคลาวด์', 'รายเดือน', 'สมาชิกรายปี', 'ค่าบริการ'
  ],
  'ประกัน': [
    'insurance', 'life insurance', 'health insurance', 'car insurance', 'aia', 'muang thai', 'allianz', 'fwd',
    'tokio marine', 'viriyah', 'dhipaya', 'กรุงเทพประกันภัย', 'วิริยะ', 'ทิพย', 'เมืองไทยประกันชีวิต', 'เอไอเอ',
    'อลิอันซ์', 'ไทยประกัน', 'ประกันรถ', 'ประกันสุขภาพ', 'ประกันชีวิต', 'เบี้ยประกัน', 'พรบ', 'ภาษีรถ'
  ],
  'ภาษี': [
    'tax', 'taxes', 'vat', 'withholding tax', 'rd', 'revenue department', 'สรรพากร', 'ภาษีมูลค่าเพิ่ม', 'ภาษีเงินได้',
    'ภงด', 'ภาษีป้าย', 'ภาษีที่ดิน', 'ยื่นภาษี', 'จ่ายภาษี'
  ],
  'ท่องเที่ยว': [
    'travel', 'trip', 'vacation', 'holiday', 'tour', 'hotel', 'resort', 'agoda', 'booking', 'airbnb', 'เที่ยว',
    'ท่องเที่ยว', 'ทริป', 'โรงแรม', 'ที่พัก', 'รีสอร์ท', 'ต่างประเทศ', 'พักผ่อน', 'ตั๋วเครื่องบิน', 'ไกด์'
  ],
  'บันเทิง': [
    'entertainment', 'fun', 'recreation', 'movie', 'cinema', 'sf', 'sf cinema', 'major', 'major cineplex',
    'concert', 'ticket', 'show', 'karaoke', 'คาราโอเกะ', 'โรงหนัง', 'ดูหนัง', 'ตั๋วหนัง', 'คอนเสิร์ต', 'ปาร์ตี้',
    'บอร์ดเกม', 'สวนสนุก', 'อีเวนต์'
  ],
  'เกม': [
    'game', 'gaming', 'steam', 'playstation', 'nintendo', 'switch', 'garena', 'rov', 'genshin', 'valorant',
    'roblox', 'เติมเกม', 'ซื้อเกม', 'สตรีม', 'การีนา', 'ไอเทม', 'จอยเกม', 'เพลย์สเตชั่น'
  ],
  'หนัง': [
    'movie', 'film', 'cinema', 'theater', 'netflix', 'series', 'ซีรีส์', 'ดูซีรีส์', 'ภาพยนตร์', 'โรงหนัง', 'ตั๋วหนัง'
  ],
  'เพลง': [
    'music', 'song', 'spotify', 'apple music', 'joox', 'youtube music', 'แผ่นเสียง', 'คอนเสิร์ต', 'ฟังเพลง', 'ดนตรี'
  ],
  'สุขภาพ': [
    'health', 'medical', 'hospital', 'clinic', 'doctor', 'physician', 'medicine', 'pharmacy', 'drug', 'dentist',
    'dental', 'checkup', 'โรงพยาบาล', 'คลินิก', 'หมอ', 'พบแพทย์', 'หาหมอ', 'ยา', 'ค่ายา', 'ร้านขายยา', 'ทำฟัน',
    'จัดฟัน', 'ขูดหินปูน', 'ตรวจสุขภาพ', 'แว่นตา', 'ตัดแว่น', 'คอนแทคเลนส์', 'วิตามิน', 'อาหารเสริม', 'รักษาสุขภาพ'
  ],
  'ฟิตเนส': [
    'fitness', 'gym', 'workout', 'exercise', 'sport', 'yoga', 'pilates', 'badminton', 'football', 'running',
    'marathon', 'ยิม', 'ออกกำลังกาย', 'โยคะ', 'พิลาทิส', 'แบดมินตัน', 'ฟุตบอล', 'วิ่ง', 'เทรนเนอร์', 'เวย์โปรตีน',
    'ค่าฟิตเนส', 'สนามกีฬา', 'ว่ายน้ำ'
  ],
  'ความงาม': [
    'beauty', 'skincare', 'cosmetics', 'salon', 'barber', 'haircut', 'spa', 'massage', 'nail', 'เสริมสวย', 'ตัดผม',
    'ร้านทำผม', 'ทำเล็บ', 'สปา', 'นวด', 'นวดแผนไทย', 'คลินิกเสริมความงาม', 'ฉีดหน้า', 'โบท็อกซ์', 'ฟิลเลอร์',
    'เลเซอร์', 'สกินแคร์', 'บำรุงผิว', 'เครื่องสำอาง'
  ],
  'สัตว์เลี้ยง': [
    'pet', 'pets', 'dog', 'cat', 'kitten', 'puppy', 'veterinary', 'pet shop', 'pet food', 'royal canin', 'kaniva',
    'me-o', 'whiskas', 'ทรายแมว', 'อาหารหมา', 'อาหารแมว', 'สัตว์เลี้ยง', 'หมา', 'แมว', 'รักษาสัตว์', 'วัคซีนหมา',
    'วัคซีนแมว', 'อาบน้ำตัดขน', 'ของเล่นสัตว์เลี้ยง', 'ทาสแมว', 'สุนัข'
  ],
  'ครอบครัว': [
    'family', 'parents', 'mom', 'dad', 'elder', 'allowance', 'พ่อ', 'แม่', 'ครอบครัว', 'ให้เงินพ่อแม่', 'กตัญญู',
    'ญาติ', 'คนในบ้าน', 'ค่าใช้จ่ายครอบครัว'
  ],
  'เด็ก': [
    'baby', 'kids', 'child', 'toddler', 'infant', 'diaper', 'milk', 'pampers', 'เด็ก', 'ลูก', 'นมผง', 'แพมเพิส',
    'ผ้าอ้อม', 'ของเล่นเด็ก', 'เสื้อผ้าเด็ก', 'ของใช้เด็ก'
  ],
  'ของขวัญ': [
    'gift', 'present', 'birthday', 'wedding', 'congratulations', 'angpao', 'ของขวัญ', 'ของฝาก', 'วันเกิด',
    'งานแต่ง', 'ซองงานแต่ง', 'งานบวช', 'ขึ้นบ้านใหม่', 'ปีใหม่', 'ของที่ระลึก'
  ],
  'บริจาค': [
    'donation', 'donate', 'charity', 'foundation', 'temple', 'merit', 'บริจาค', 'ทำบุญ', 'มูลนิธิ', 'วัด',
    'สังฆทาน', 'ช่วยเหลือ', 'การกุศล', 'ปล่อยนกปล่อยปลา'
  ],
  'เรียน': [
    'education', 'study', 'school', 'university', 'tuition', 'course', 'class', 'book', 'books', 'stationery',
    'การศึกษา', 'ค่าเทอม', 'เรียนพิเศษ', 'คอร์สเรียน', 'หนังสือ', 'อุปกรณ์การเรียน', 'เครื่องเขียน', 'อบรม', 'สัมมนา'
  ],
  'งาน': [
    'work', 'job', 'business', 'office', 'career', 'งาน', 'ทำงาน', 'ธุรกิจ', 'อุปกรณ์ทำงาน', 'เครื่องใช้สำนักงาน'
  ],
  'ออฟฟิศ': [
    'office', 'workplace', 'supplies', 'coworking', 'ออฟฟิศ', 'ที่ทำงาน', 'โคเวิร์กกิ้ง', 'โต๊ะทำงาน'
  ],
  'เงินเดือน': [
    'salary', 'wage', 'payroll', 'income', 'monthly salary', 'paycheck', 'เงินเดือน', 'ค่าจ้าง', 'รายได้ประจำ',
    'เงินโอนเข้า', 'เงินประจำ', 'รับเงินเดือน'
  ],
  'พาร์ทไทม์': [
    'part-time', 'parttime', 'hourly', 'wage', 'พาร์ทไทม์', 'งานพิเศษ', 'รายได้เสริม', 'รับจ้าง', 'ค่าแรง', 'งานนอกเวลา'
  ],
  'ฟรีแลนซ์': [
    'freelance', 'freelancer', 'gig', 'project', 'contract', 'ฟรีแลนซ์', 'รับงาน', 'ค่าจ้างทำของ', 'ค่างาน', 'โปรเจกต์', 'สัญญาจ้าง'
  ],
  'ขายของ': [
    'sales', 'shop', 'seller', 'commerce', 'business', 'ขายของ', 'รายได้ขายของ', 'กำไรขายของ', 'แม่ค้า', 'พ่อค้า',
    'ยอดขาย', 'ออเดอร์', 'ขายออนไลน์', 'กำไร'
  ],
  'โบนัส': [
    'bonus', 'incentive', 'reward', 'โบนัส', 'เงินพิเศษ', 'รางวัล', 'เงินก้นถุง', 'โบนัสประจำปี', 'อินเซนทีฟ'
  ],
  'อั่งเปา': [
    'angpao', 'red envelope', 'chinese new year', 'gift money', 'อั่งเปา', 'แต๊ะเอีย', 'ตรุษจีน', 'เงินรับขวัญ', 'ซองแดง'
  ],
  'ดอกเบี้ย': [
    'interest', 'yield', 'bank interest', 'ดอกเบี้ย', 'ดอกเบี้ยเงินฝาก', 'ดอกเบี้ยรับ', 'ผลตอบแทน'
  ],
  'ปันผล': [
    'dividend', 'stock dividend', 'share', 'ปันผล', 'เงินปันผล', 'หุ้นปันผล', 'กองทุนปันผล'
  ],
  'ขายกองทุน': [
    'mutual fund', 'fund', 'nav', 'กองทุน', 'ขายกองทุน', 'กำไรกองทุน', 'ssf', 'rmf', 'thaiesg', 'กองทุนรวม'
  ],
  'คริปโต': [
    'crypto', 'cryptocurrency', 'bitcoin', 'btc', 'eth', 'usdt', 'binance', 'bitkub', 'คริปโต', 'บิตคอยน์',
    'เหรียญดิจิทัล', 'กำไรคริปโต', 'เทรดคริปโต'
  ],
  'โอนเงิน': [
    'transfer', 'money transfer', 'receive', 'โอนเงิน', 'รับเงินโอน', 'โอนเข้า', 'เติมเงินเข้า', 'ได้รับเงิน'
  ],
  'คืนเงิน': [
    'refund', 'cashback', 'rebate', 'return', 'คืนเงิน', 'เงินคืน', 'แคชแบ็ค', 'รีฟันด์', 'ได้เงินคืน'
  ],
  'บิล': [
    'bill', 'bills', 'invoice', 'paper', 'tax', 'statement', 'payment', 'slip', 'บิล', 'ใบเสร็จ', 'ใบแจ้งหนี้',
    'ค่าน้ำค่าไฟ', 'สลิป', 'ชำระเงิน', 'เอกสาร', 'จ่ายบิล'
  ],
  'ยังไม่จัดหมวด': [
    'uncategorized', 'other', 'general', 'misc', 'ยังไม่จัดหมวด', 'ไม่ระบุ', 'ทั่วไป', 'อื่นๆ'
  ],
  'อื่นๆ': [
    'other', 'others', 'misc', 'miscellaneous', 'etc', 'อื่นๆ', 'อื่น', 'ทั่วไป'
  ],
};

/**
 * Intelligent bilingual category search matcher.
 * Matches category name, English name, localized name, group name, icon keywords, and synonym dictionary.
 */
export const matchCategorySearch = (
  categoryName: string,
  categoryData?: DBCategory,
  query?: string,
  language?: string
): boolean => {
  if (!query || !query.trim()) return true;
  
  const rawQ = query.trim().toLowerCase();
  const tokens = rawQ.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const catKey = categoryName.toLowerCase();
  const enName = (DEFAULT_CATEGORY_EN_NAMES[categoryName] || '').toLowerCase();
  const locName = getCategoryDisplayName(categoryName, language).toLowerCase();
  const group = (categoryData?.group || '').toLowerCase();
  const enGroup = (DEFAULT_GROUP_EN_NAMES[categoryData?.group || ''] || '').toLowerCase();
  const locGroup = getGroupDisplayName(categoryData?.group || '', language).toLowerCase();
  
  const iconKeywords = (categoryData?.iconName && ICON_KEYWORDS[categoryData.iconName]) || [];
  const synonyms = CATEGORY_SEARCH_SYNONYMS[categoryName] || [];

  // Build searchable text bag for this category
  const searchableBag: string[] = [
    catKey,
    enName,
    locName,
    group,
    enGroup,
    locGroup,
    ...(categoryData?.iconName ? [categoryData.iconName.toLowerCase()] : []),
    ...iconKeywords.map(k => k.toLowerCase()),
    ...synonyms.map(s => s.toLowerCase()),
  ];

  // 1. Direct or partial match on primary names & groups
  if (
    catKey.includes(rawQ) ||
    enName.includes(rawQ) ||
    locName.includes(rawQ) ||
    group.includes(rawQ) ||
    enGroup.includes(rawQ) ||
    locGroup.includes(rawQ)
  ) {
    return true;
  }

  // 2. Direct match against any synonym or icon keyword
  const directMatch = searchableBag.some(word => 
    word.includes(rawQ) || (rawQ.length >= 3 && rawQ.includes(word) && word.length >= 2)
  );
  if (directMatch) return true;

  // 3. Multi-token match (e.g. "ค่า ไฟ", "fast food", "กาแฟ สตาร์")
  const allTokensMatch = tokens.every(token => 
    searchableBag.some(word => word.includes(token))
  );

  return allTokensMatch;
};

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
