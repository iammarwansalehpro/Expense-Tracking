import PageHeader from '@/components/layout/PageHeader';
import TransactionList from '@/components/transactions/TransactionList';

export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="รายการทั้งหมด" />
      <TransactionList />
      <div className="h-4" />
    </>
  );
}

