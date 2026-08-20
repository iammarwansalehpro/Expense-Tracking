import type { Transaction, Wallet } from '@/types';
import type { User } from 'firebase/auth';
import { calculateCreditCardStats } from '@/utils/creditCardUtils';

export interface SmartInsight {
  id: string;
  text: string;
  type: 'budget_good' | 'budget_warning' | 'budget_over' | 'credit_due' | 'comparison' | 'lifestyle' | 'milestone';
  dotColor: string;
  glowColor: string;
  priority: number; // Higher number = higher priority
}

export interface SmartAdvisorResult {
  primaryDotColor: string;
  primaryGlowColor: string;
  insights: string[];
  combinedTickerText: string;
}

interface AdvisorInput {
  transactions: Transaction[];
  wallets: Wallet[];
  dailyBudget: number;
  monthlyBudget?: number;
  user: User | null;
  language: 'th' | 'en';
  now?: Date;
}

export function generateSmartInsights({
  transactions,
  wallets,
  dailyBudget,
  user,
  language = 'th',
  now = new Date()
}: AdvisorInput): SmartAdvisorResult {
  const isThai = language === 'th';
  const targetDaily = dailyBudget > 0 ? dailyBudget : 500;
  
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat

  // 1. Calculate Today's Expenses and Incomes
  const todayTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getDate() === currentDay && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const todayExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Calculate Yesterday's Expenses
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yDay = yesterday.getDate();
  const yMonth = yesterday.getMonth();
  const yYear = yesterday.getFullYear();

  const yesterdayExpense = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getDate() === yDay && d.getMonth() === yMonth && d.getFullYear() === yYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // 3. Calculate This Month's Net Savings
  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpense = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthNetSavings = monthIncome - monthExpense;

  // 4. Find Today's Top Expense Category
  const categoryTotals: Record<string, number> = {};
  todayTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = t.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    });

  let topCategory = '';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = amt;
    }
  });

  // Candidate pool of smart insights
  const pool: SmartInsight[] = [];

  const remaining = targetDaily - todayExpense;
  const spentPercent = Math.round((todayExpense / targetDaily) * 100);

  // --- Insight Layer 1: Time-of-Day & Budget Real-time Coach ---
  if (todayExpense === 0) {
    if (currentHour >= 5 && currentHour < 12) {
      pool.push({
        id: 'morning_fresh',
        text: isThai 
          ? `เริ่มต้นเช้าวันใหม่อย่างสดใส พร้อมงบ ฿${targetDaily.toLocaleString()} วันนี้`
          : `Fresh morning! ฿${targetDaily.toLocaleString()} budget ready for today`,
        type: 'budget_good',
        dotColor: 'bg-emerald-500',
        glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        priority: 95
      });
    } else if (currentHour >= 12 && currentHour < 17) {
      pool.push({
        id: 'afternoon_zero',
        text: isThai 
          ? `บ่ายนี้ยังไม่มีรายจ่าย คุมงบได้ยอดเยี่ยมมาก`
          : `Zero expenses so far this afternoon. Great discipline!`,
        type: 'budget_good',
        dotColor: 'bg-emerald-500',
        glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        priority: 90
      });
    } else if (currentHour >= 17 && currentHour < 22) {
      pool.push({
        id: 'evening_no_spend',
        text: isThai 
          ? `สุดยอดมาก! วันนี้เป็นวัน No-Spend ประหยัดได้เต็มร้อย`
          : `Awesome! Zero expenses today, 100% saved!`,
        type: 'budget_good',
        dotColor: 'bg-emerald-500',
        glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        priority: 95
      });
    } else {
      pool.push({
        id: 'night_peace',
        text: isThai 
          ? `พักผ่อนให้เต็มที่นะ วันนี้คุมการเงินได้ดีเยี่ยม 🌙`
          : `Rest well! You managed your finances wonderfully today 🌙`,
        type: 'budget_good',
        dotColor: 'bg-emerald-500',
        glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        priority: 85
      });
    }
  } else if (remaining >= 0) {
    if (spentPercent <= 50) {
      pool.push({
        id: 'budget_plenty',
        text: isThai 
          ? `วันนี้คุมงบดีเยี่ยม ใช้ไปเพียง ${spentPercent}% เหลืออีก ฿${remaining.toLocaleString()}`
          : `Great pacing! Used ${spentPercent}%, ฿${remaining.toLocaleString()} left today`,
        type: 'budget_good',
        dotColor: 'bg-emerald-500',
        glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        priority: 90
      });
    } else if (spentPercent < 80) {
      pool.push({
        id: 'budget_steady',
        text: isThai 
          ? `การใช้จ่ายยังอยู่ในแผน เหลืออีก ฿${remaining.toLocaleString()} สำหรับวันนี้`
          : `Spending on track. ฿${remaining.toLocaleString()} remaining for today`,
        type: 'budget_good',
        dotColor: 'bg-emerald-500',
        glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        priority: 88
      });
    } else {
      pool.push({
        id: 'budget_caution',
        text: isThai 
          ? `วันนี้ใช้ไป ${spentPercent}% แล้ว เหลืออีก ฿${remaining.toLocaleString()} ชะลอหน่อยนะ`
          : `Used ${spentPercent}% of daily budget, ฿${remaining.toLocaleString()} left. Steady hands!`,
        type: 'budget_warning',
        dotColor: 'bg-amber-500',
        glowColor: 'shadow-[0_0_8px_rgba(245,158,11,0.7)] dark:shadow-[0_0_10px_rgba(251,191,36,0.8)]',
        priority: 92
      });
    }
  } else {
    // Over Budget
    const overAmount = Math.abs(remaining);
    pool.push({
      id: 'budget_exceeded',
      text: isThai 
        ? `วันนี้เกินงบไป ฿${overAmount.toLocaleString()} นิดหน่อย พรุ่งนี้ค่อยบาลานซ์กันใหม่นะ`
        : `Over budget by ฿${overAmount.toLocaleString()} today. We can rebalance tomorrow!`,
      type: 'budget_over',
      dotColor: 'bg-rose-500',
      glowColor: 'shadow-[0_0_8px_rgba(244,63,94,0.7)] dark:shadow-[0_0_10px_rgba(251,113,133,0.8)]',
      priority: 96
    });
  }

  // --- Insight Layer 2: Credit Card Due Alerts (Caring Reminder) ---
  const creditCards = wallets.filter(w => w.type === 'credit_card');
  for (const card of creditCards) {
    const stats = calculateCreditCardStats(card, transactions, now);
    if (stats.statementBalance > 0 && stats.nextDueDate) {
      const diffTime = stats.nextDueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 5) {
        const daysText = diffDays === 0 
          ? (isThai ? 'วันนี้' : 'today') 
          : (isThai ? `อีก ${diffDays} วัน` : `in ${diffDays} days`);

        pool.push({
          id: `cc_due_${card.id}`,
          text: isThai 
            ? `บัตร ${card.name} ครบกำหนดชำระ${daysText} (฿${Math.round(stats.statementBalance).toLocaleString()})`
            : `${card.name} payment due ${daysText} (฿${Math.round(stats.statementBalance).toLocaleString()})`,
          type: 'credit_due',
          dotColor: diffDays <= 2 ? 'bg-rose-500' : 'bg-amber-500',
          glowColor: diffDays <= 2 
            ? 'shadow-[0_0_8px_rgba(244,63,94,0.7)] dark:shadow-[0_0_10px_rgba(251,113,133,0.8)]'
            : 'shadow-[0_0_8px_rgba(245,158,11,0.7)] dark:shadow-[0_0_10px_rgba(251,191,36,0.8)]',
          priority: diffDays <= 2 ? 98 : 91
        });
      }
    }
  }

  // --- Insight Layer 3: Compared to Yesterday (Habit Comparison) ---
  if (yesterdayExpense > 0 && todayExpense > 0) {
    const diff = yesterdayExpense - todayExpense;
    if (diff > 50) {
      const pct = Math.round((diff / yesterdayExpense) * 100);
      pool.push({
        id: 'spent_less_yesterday',
        text: isThai 
          ? `วันนี้ใช้จ่ายน้อยกว่าเมื่อวาน ฿${Math.round(diff).toLocaleString()} (${pct}%) เซฟเงินได้ดี!`
          : `Saved ฿${Math.round(diff).toLocaleString()} (${pct}%) compared to yesterday!`,
        type: 'comparison',
        dotColor: 'bg-emerald-500',
        glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        priority: 84
      });
    }
  }

  // --- Insight Layer 4: Income & Monthly Savings Milestone ---
  if (todayIncome > 0) {
    pool.push({
      id: 'today_income',
      text: isThai 
        ? `มีรายรับเข้าวันนี้ ฿${todayIncome.toLocaleString()} แบ่งเก็บออมสักนิดเพื่ออนาคตนะ`
        : `Received ฿${todayIncome.toLocaleString()} income today! Set some aside for goals`,
      type: 'milestone',
      dotColor: 'bg-indigo-500',
      glowColor: 'shadow-[0_0_8px_rgba(99,102,241,0.7)] dark:shadow-[0_0_10px_rgba(129,140,248,0.8)]',
      priority: 89
    });
  } else if (monthNetSavings > 1000) {
    pool.push({
      id: 'monthly_savings_positive',
      text: isThai 
        ? `เดือนนี้มียอดเงินออมสะสมสุทธิ ฿${Math.round(monthNetSavings).toLocaleString()} เก่งมาก!`
        : `Net savings this month is ฿${Math.round(monthNetSavings).toLocaleString()}! Keep it up!`,
      type: 'milestone',
      dotColor: 'bg-emerald-500',
      glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]',
      priority: 78
    });
  }

  // --- Insight Layer 5: Lifestyle & Day-of-Week Empathy ---
  if (dayOfWeek === 5) { // Friday
    pool.push({
      id: 'friday_vibe',
      text: isThai 
        ? `สุขสันต์วันศุกร์! สัปดาห์นี้จัดการเงินได้น่าประทับใจมาก`
        : `Happy Friday! You've managed finances impressively this week`,
      type: 'lifestyle',
      dotColor: 'bg-indigo-500',
      glowColor: 'shadow-[0_0_8px_rgba(99,102,241,0.7)] dark:shadow-[0_0_10px_rgba(129,140,248,0.8)]',
      priority: 75
    });
  } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
    pool.push({
      id: 'weekend_vibe',
      text: isThai 
        ? `สุดสัปดาห์นี้พักผ่อนให้เต็มที่ คุมงบได้สบายใจ`
        : `Enjoy your weekend with peace of mind and budget in check`,
      type: 'lifestyle',
      dotColor: 'bg-purple-500',
      glowColor: 'shadow-[0_0_8px_rgba(168,85,247,0.7)] dark:shadow-[0_0_10px_rgba(192,132,252,0.8)]',
      priority: 74
    });
  } else if (currentDay >= 25) {
    pool.push({
      id: 'month_end_strong',
      text: isThai 
        ? `เข้าสู่ช่วงปลายเดือน การเงินยังแข็งแกร่ง เก่งมาก!`
        : `Entering month-end, your finances remain strong. Well done!`,
      type: 'lifestyle',
      dotColor: 'bg-emerald-500',
      glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]',
      priority: 76
    });
  }

  // Sort pool by priority descending
  pool.sort((a, b) => b.priority - a.priority);

  // Take top 2-3 distinct insights to create a rich, rotating companion ticker
  const selected = pool.slice(0, 3);

  const primaryItem = selected[0] || {
    dotColor: 'bg-emerald-500',
    glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.7)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]',
    text: isThai ? 'คุมงบได้ดีเยี่ยม วันนี้พร้อมลุยต่อ!' : 'Budget on track, ready for today!'
  };

  const insightTexts = selected.map(s => s.text);
  // Repeat list or combine with bullet
  const combinedTickerText = insightTexts.join('  •  ');

  return {
    primaryDotColor: primaryItem.dotColor,
    primaryGlowColor: primaryItem.glowColor,
    insights: insightTexts,
    combinedTickerText
  };
}
