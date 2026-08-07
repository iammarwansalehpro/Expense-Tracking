import { createPortal } from 'react-dom';
import { X, Edit3, Trash2, Calendar, Tag, FileText, Banknote } from 'lucide-react';
import { getCategoryStyle } from '@/utils/categoryStyles';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAppStore } from '@/store/useAppStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { deleteTransaction } from '@/services/transactionService';
import { useToastStore } from '@/store/useToastStore';
import { useEffect, useState } from 'react';

interface Props {
  transactionId: string | null;
  onClose: () => void;
}

export default function TransactionDetailsModal({ transactionId, onClose }: Props) {
  const transactions = useTransactionStore(s => s.transactions);
  const setCurrentPage = useAppStore(s => s.setCurrentPage);
  const setEditingTransactionId = useAppStore(s => s.setEditingTransactionId);
  const appCategories = useAppStore(s => s.appCategories);

  const [internalId, setInternalId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (transactionId) {
      setInternalId(transactionId);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setInternalId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [transactionId]);

  const tx = transactions.find(t => t.id === internalId);

  if (!tx && !internalId) return null;

  if (!tx) {
    return (
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
    );
  }

  const catStyle = getCategoryStyle(tx.category || '', appCategories || undefined);
  const IconComponent = catStyle.icon;

  const handleEdit = () => {
    setEditingTransactionId(tx.id);
    setCurrentPage('add');
    onClose();
  };

  const handleDelete = () => {
    useConfirmStore.getState().showConfirm({
      title: 'ลบรายการ',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? ข้อมูลที่ลบจะไม่สามารถกู้คืนได้',
      confirmText: 'ลบรายการ',
      cancelText: 'ยกเลิก',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteTransaction(tx.id);
          useToastStore.getState().addToast('ลบรายการสำเร็จ', 'success');
        } catch (e) {
          useToastStore.getState().addToast('เกิดข้อผิดพลาดในการลบรายการ', 'error');
        }
        onClose();
      }
    });
  };

  const d = new Date(tx.date);
  const thaiDate = d.toLocaleDateString('th-TH', { 
    day: '2-digit', month: 'long', year: 'numeric'
  });
  
  // Clean time string to prevent redundant AM/PM text
  const cleanTime = (tx.time || '00:00').replace(/ am| pm| น./gi, '').trim();
  const formattedDate = `${thaiDate} เวลา ${cleanTime} น.`;

  return createPortal(
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl rounded-t-[32px] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[101] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-t border-white/60 flex flex-col max-h-[85vh] ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-white/50 ${catStyle.color} ${catStyle.textColor}`}>
            <IconComponent className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#2E1065] text-center">{tx.title}</h2>
          <div className={`text-3xl font-black mt-2 tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-[#2E1065]'}`}>
            {tx.type === 'income' ? '+' : '-'}฿{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-8 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/50">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">วันเวลา</p>
              <p className="text-[14px] font-semibold text-[#2E1065]">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">หมวดหมู่</p>
              <p className="text-[14px] font-semibold text-[#2E1065]">{tx.category || 'ไม่ได้ระบุ'}</p>
            </div>
          </div>

          {tx.bank && (
            <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/50">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">บัญชี/ช่องทาง</p>
                <p className="text-[14px] font-semibold text-[#2E1065]">{tx.bank}</p>
              </div>
            </div>
          )}

          {tx.note && (
            <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/50">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">บันทึกช่วยจำ</p>
                <p className="text-[14px] font-semibold text-[#2E1065]">{tx.note}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-auto pt-2">
          <button 
            onClick={handleEdit}
            className="flex-1 py-4 bg-purple-100 text-purple-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-200 active:scale-[0.98] transition-all"
          >
            <Edit3 className="w-5 h-5" />
            แก้ไขข้อมูล
          </button>
          <button 
            onClick={handleDelete}
            className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 hover:bg-rose-100 active:scale-[0.98] transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
