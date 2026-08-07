import { createPortal } from 'react-dom';
import { useConfirmStore } from '@/store/useConfirmStore';
import { AlertTriangle, X } from 'lucide-react';

export default function GlobalConfirmModal() {
  const { isOpen, title, message, confirmText, cancelText, isDestructive, onConfirm, hideConfirm } = useConfirmStore();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#2E1065]/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={hideConfirm}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_24px_48px_rgba(46,16,101,0.15)] border border-white/60 animate-in zoom-in-95 fade-in duration-200">
        <button 
          onClick={hideConfirm}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-[#A855F7]/10 text-[#A855F7]'}`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
          
          <h2 className="text-[22px] font-black text-[#2E1065] tracking-tight mb-2">
            {title}
          </h2>
          
          <p className="text-[#2E1065]/60 text-sm font-medium mb-8 leading-relaxed px-2">
            {message}
          </p>
          
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                onConfirm();
                hideConfirm();
              }}
              className={`w-full py-3.5 rounded-[18px] font-bold text-[15px] transition-all active:scale-95 shadow-sm ${
                isDestructive 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                  : 'bg-gradient-to-r from-[#A855F7] to-[#6D28D9] hover:opacity-90 text-white'
              }`}
            >
              {confirmText}
            </button>
            <button
              onClick={hideConfirm}
              className="w-full py-3.5 rounded-[18px] font-bold text-[15px] text-[#2E1065]/70 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
