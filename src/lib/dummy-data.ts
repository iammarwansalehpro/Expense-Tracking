import type { Transaction, MonthlyData } from '@/types';

// Helper to create dates relative to today
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const DUMMY_TRANSACTIONS: Transaction[] = [
  // === วันนี้ ===
  {
    id: 't1',
    type: 'expense',
    amount: 189,
    category: 'food',
    title: 'ข้าวมันไก่ + ชานมไข่มุก',
    date: daysAgo(0),
    time: daysAgo(0),
  },
  {
    id: 't2',
    type: 'expense',
    amount: 45,
    category: 'transport',
    title: 'BTS สยาม - อโศก',
    date: daysAgo(0),
    time: daysAgo(0),
  },
  {
    id: 't3',
    type: 'expense',
    amount: 350,
    category: 'shopping',
    title: 'เสื้อยืด Uniqlo',
    date: daysAgo(0),
    time: daysAgo(0),
  },

  // === เมื่อวาน ===
  {
    id: 't4',
    type: 'expense',
    amount: 250,
    category: 'food',
    title: 'อาหารญี่ปุ่น Fuji',
    date: daysAgo(1),
    time: daysAgo(1),
  },
  {
    id: 't5',
    type: 'expense',
    amount: 1500,
    category: 'bills',
    title: 'ค่าอินเทอร์เน็ต AIS Fibre',
    date: daysAgo(1),
    time: daysAgo(1),
  },
  {
    id: 't6',
    type: 'income',
    amount: 3500,
    category: 'freelance',
    title: 'งานออกแบบโลโก้',
    date: daysAgo(1),
    time: daysAgo(1),
  },

  // === 2 วันก่อน ===
  {
    id: 't7',
    type: 'expense',
    amount: 85,
    category: 'food',
    title: 'กาแฟ Café Amazon',
    date: daysAgo(2),
    time: daysAgo(2),
  },
  {
    id: 't8',
    type: 'expense',
    amount: 500,
    category: 'health',
    title: 'ยาแก้ไอ + วิตามินซี',
    date: daysAgo(2),
    time: daysAgo(2),
  },

  // === 3 วันก่อน ===
  {
    id: 't9',
    type: 'expense',
    amount: 299,
    category: 'entertainment',
    title: 'Netflix รายเดือน',
    date: daysAgo(3),
    time: daysAgo(3),
  },
  {
    id: 't10',
    type: 'expense',
    amount: 120,
    category: 'food',
    title: 'ส้มตำ + ไก่ย่าง',
    date: daysAgo(3),
    time: daysAgo(3),
  },

  // === 5 วันก่อน ===
  {
    id: 't11',
    type: 'income',
    amount: 45000,
    category: 'salary',
    title: 'เงินเดือน สิงหาคม',
    date: daysAgo(5),
    time: daysAgo(5),
  },
  {
    id: 't12',
    type: 'expense',
    amount: 8500,
    category: 'bills',
    title: 'ค่าเช่าห้อง',
    date: daysAgo(5),
    time: daysAgo(5),
  },

  // === 7 วันก่อน ===
  {
    id: 't13',
    type: 'expense',
    amount: 2300,
    category: 'shopping',
    title: 'รองเท้า Nike Air Max',
    date: daysAgo(7),
    time: daysAgo(7),
  },
  {
    id: 't14',
    type: 'expense',
    amount: 65,
    category: 'transport',
    title: 'Grab บ้าน - ออฟฟิศ',
    date: daysAgo(7),
    time: daysAgo(7),
  },
  {
    id: 't15',
    type: 'expense',
    amount: 199,
    category: 'food',
    title: 'พิซซ่า The Pizza Company',
    date: daysAgo(7),
    time: daysAgo(7),
  },

  // === 10 วันก่อน ===
  {
    id: 't16',
    type: 'expense',
    amount: 1200,
    category: 'education',
    title: 'คอร์ส Udemy - React',
    date: daysAgo(10),
    time: daysAgo(10),
  },
  {
    id: 't17',
    type: 'income',
    amount: 5000,
    category: 'bonus',
    title: 'โบนัสไตรมาส Q2',
    date: daysAgo(10),
    time: daysAgo(10),
  },

  // === 14 วันก่อน ===
  {
    id: 't18',
    type: 'expense',
    amount: 890,
    category: 'food',
    title: 'บุฟเฟ่ต์ปิ้งย่าง Premium',
    date: daysAgo(14),
    time: daysAgo(14),
  },
  {
    id: 't19',
    type: 'expense',
    amount: 150,
    category: 'transport',
    title: 'เติมน้ำมัน มอเตอร์ไซค์',
    date: daysAgo(14),
    time: daysAgo(14),
  },
  {
    id: 't20',
    type: 'expense',
    amount: 450,
    category: 'entertainment',
    title: 'ตั๋วหนัง IMAX x2',
    date: daysAgo(14),
    time: daysAgo(14),
  },

  // === 20 วันก่อน ===
  {
    id: 't21',
    type: 'income',
    amount: 12000,
    category: 'freelance',
    title: 'งานพัฒนาเว็บไซต์ ร้านอาหาร',
    date: daysAgo(20),
    time: daysAgo(20),
  },
  {
    id: 't22',
    type: 'expense',
    amount: 3200,
    category: 'shopping',
    title: 'AirPods Pro Case + สายชาร์จ',
    date: daysAgo(20),
    time: daysAgo(20),
  },
  {
    id: 't23',
    type: 'expense',
    amount: 75,
    category: 'food',
    title: 'ก๋วยเตี๋ยวเรือ + น้ำมะนาว',
    date: daysAgo(20),
    time: daysAgo(20),
  },

  // === 25 วันก่อน ===
  {
    id: 't24',
    type: 'expense',
    amount: 2500,
    category: 'health',
    title: 'ตรวจสุขภาพประจำปี',
    date: daysAgo(25),
    time: daysAgo(25),
  },
  {
    id: 't25',
    type: 'expense',
    amount: 180,
    category: 'food',
    title: 'ข้าวผัดกระเพรา + ไข่ดาว x2',
    date: daysAgo(25),
    time: daysAgo(25),
  },
  {
    id: 't26',
    type: 'expense',
    amount: 35,
    category: 'transport',
    title: 'รถเมล์ ปรับอากาศ',
    date: daysAgo(25),
    time: daysAgo(25),
  },
  {
    id: 't27',
    type: 'income',
    amount: 2000,
    category: 'investment',
    title: 'ปันผล กองทุน LTF',
    date: daysAgo(25),
    time: daysAgo(25),
  },
];

export const MONTHLY_DATA: MonthlyData[] = [
  { month: 'ม.ค.', income: 48000, expense: 22000 },
  { month: 'ก.พ.', income: 45000, expense: 19500 },
  { month: 'มี.ค.', income: 52000, expense: 25000 },
  { month: 'เม.ย.', income: 45000, expense: 31000 },
  { month: 'พ.ค.', income: 48000, expense: 20000 },
  { month: 'มิ.ย.', income: 55000, expense: 24000 },
  { month: 'ก.ค.', income: 51000, expense: 28500 },
  { month: 'ส.ค.', income: 67500, expense: 22793 },
];
