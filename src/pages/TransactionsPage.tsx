import AppHeader from '@/components/layout/AppHeader';
import TransactionList from '@/components/transactions/TransactionList';

export default function TransactionsPage() {
  return (
    <div className="flex flex-col h-full bg-transparent animate-fade-in">
      <AppHeader pageTitle="รายการทั้งหมด" />
      <div className="flex-1  no-scrollbar">
        <TransactionList />
      </div>
    </div>
  );
}
