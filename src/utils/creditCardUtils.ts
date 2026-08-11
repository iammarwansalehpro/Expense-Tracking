import type { Transaction, Wallet } from '@/types';

export interface CreditCardStats {
  outstandingBalance: number;    // Total debt (normal + installments principal left)
  statementBalance: number;      // Amount due for current cycle
  minimumPayment: number;        // Minimum payment required
  normalDebt: number;            // Normal balance (for UI)
  installmentDebt: number;       // Unpaid installment principal
  revolvingInterest: number;     // Accumulated unpaid interest
  currentStatementDate: Date;
  nextDueDate: Date;
}

export const ANNUAL_INTEREST_RATE = 0.16; // 16%
export const DAILY_RATE = ANNUAL_INTEREST_RATE / 365;

export function calculateCreditCardStats(wallet: Wallet, allTransactions: Transaction[], currentDate: Date = new Date()): CreditCardStats {
  const statementDay = wallet.statementDay || 10;
  const dueDay = wallet.dueDay || 25;

  // Filter transactions related to this card
  const txs = allTransactions
    .filter(t => t.walletId === wallet.id || t.toWalletId === wallet.id || t.fromWalletId === wallet.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Current Statement Date (most recent statement day <= current date)
  let currentStatementDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), statementDay);
  if (currentStatementDate > currentDate) {
    currentStatementDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, statementDay);
  }

  // Next Due Date (first due day after current statement date)
  let nextDueDate = new Date(currentStatementDate.getFullYear(), currentStatementDate.getMonth(), dueDay);
  if (nextDueDate <= currentStatementDate) {
    nextDueDate = new Date(currentStatementDate.getFullYear(), currentStatementDate.getMonth() + 1, dueDay);
  }

  let totalPayments = 0;
  let totalNormalExpenses = 0;
  let totalInterestBilled = 0;
  
  // Installment trackers
  let totalInstallmentPrincipal = 0;
  let totalBilledInstallmentPrincipal = 0;
  let totalBilledInstallmentInterest = 0;

  // Billing Cycle tracking
  let statementNormalExpenses = 0;
  let statementBilledInstallmentPrincipal = 0;
  let statementBilledInstallmentInterest = 0;
  
  for (const tx of txs) {
    const txDate = new Date(tx.date);
    const isPayment = tx.type === 'income' || (tx.type === 'transfer' && tx.toWalletId === wallet.id);
    const isNormalExpense = !tx.isInstallment && (tx.type === 'expense' || (tx.type === 'transfer' && tx.fromWalletId === wallet.id));
    const isInstallment = tx.isInstallment && tx.type === 'expense';

    if (isPayment) {
      totalPayments += tx.amount;
    } else if (isNormalExpense) {
      totalNormalExpenses += tx.amount;
      if (txDate <= currentStatementDate) {
        statementNormalExpenses += tx.amount;
      }
    } else if (isInstallment) {
      const principal = tx.amount;
      totalInstallmentPrincipal += principal;
      
      const months = tx.installmentMonths || 1;
      const rate = (tx.installmentInterestRate || 0) / 100;
      const principalPerMonth = principal / months;
      const interestPerMonth = principal * rate;
      
      // Calculate how many months have been billed up to TODAY
      const monthsBilledToToday = getMonthsBilled(txDate, currentDate, statementDay);
      const cappedMonthsToToday = Math.min(monthsBilledToToday, months);
      
      totalBilledInstallmentPrincipal += cappedMonthsToToday * principalPerMonth;
      totalBilledInstallmentInterest += cappedMonthsToToday * interestPerMonth;

      // Calculate how many months have been billed up to STATEMENT DATE
      const monthsBilledToStmt = getMonthsBilled(txDate, currentStatementDate, statementDay);
      const cappedMonthsToStmt = Math.min(monthsBilledToStmt, months);
      
      statementBilledInstallmentPrincipal += cappedMonthsToStmt * principalPerMonth;
      statementBilledInstallmentInterest += cappedMonthsToStmt * interestPerMonth;
    }
  }

  // Revolving Interest Approximation:
  // We apply 16% on the unpaid normal balance roughly if carried over.
  let remainingPayment = totalPayments;

  // 1. Pay off fixed installment interest
  const paidInstallmentInterest = Math.min(totalBilledInstallmentInterest, remainingPayment);
  remainingPayment -= paidInstallmentInterest;

  // 2. Pay off normal expenses
  const paidNormal = Math.min(totalNormalExpenses, remainingPayment);
  const unpaidNormal = totalNormalExpenses - paidNormal;
  remainingPayment -= paidNormal;

  // 3. Pay off billed installment principal
  const paidBilledPrincipal = Math.min(totalBilledInstallmentPrincipal, remainingPayment);
  const unpaidBilledPrincipal = totalBilledInstallmentPrincipal - paidBilledPrincipal;
  remainingPayment -= paidBilledPrincipal;

  // Calculate revolving interest (approximate: 16% on unpaid normal balance for 30 days)
  let revolvingInterest = 0;
  if (unpaidNormal > 0 && currentDate > nextDueDate) {
      revolvingInterest = unpaidNormal * DAILY_RATE * 30; // Rough approximation
  }
  totalInterestBilled = totalBilledInstallmentInterest + revolvingInterest;

  // Total Installment Debt = Total Principal - Paid Principal
  const paidTotalPrincipal = paidBilledPrincipal + remainingPayment; 
  const actualPaidPrincipal = Math.min(totalInstallmentPrincipal, paidTotalPrincipal);
  const installmentDebt = totalInstallmentPrincipal - actualPaidPrincipal;

  const normalDebt = unpaidNormal;
  
  // Statement Balance (Amount Due for current cycle)
  let statementBalance = (statementNormalExpenses + statementBilledInstallmentPrincipal + statementBilledInstallmentInterest + revolvingInterest) - totalPayments;
  statementBalance = Math.max(0, statementBalance);

  // Outstanding Balance
  let outstandingBalance = normalDebt + installmentDebt;

  // Minimum Payment
  let minimumPayment = (statementNormalExpenses * 0.10) + statementBilledInstallmentPrincipal + statementBilledInstallmentInterest + revolvingInterest;
  minimumPayment = Math.max(0, minimumPayment - totalPayments);
  
  // Cap min payment at statement balance
  minimumPayment = Math.min(statementBalance, minimumPayment);

  if (minimumPayment > 0 && minimumPayment < 1000) {
      minimumPayment = Math.min(statementBalance, 1000);
  }

  return {
    outstandingBalance,
    statementBalance,
    minimumPayment,
    normalDebt,
    installmentDebt,
    revolvingInterest,
    currentStatementDate,
    nextDueDate
  };
}

function getMonthsBilled(txDate: Date, targetDate: Date, statementDay: number): number {
  if (txDate > targetDate) return 0;
  let m = 0;
  let d = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
  
  let firstStatement = new Date(d.getFullYear(), d.getMonth(), statementDay);
  if (firstStatement < d) {
    firstStatement = new Date(d.getFullYear(), d.getMonth() + 1, statementDay);
  }
  
  while (firstStatement <= targetDate) {
    m++;
    firstStatement = new Date(firstStatement.getFullYear(), firstStatement.getMonth() + 1, statementDay);
  }
  return m;
}
