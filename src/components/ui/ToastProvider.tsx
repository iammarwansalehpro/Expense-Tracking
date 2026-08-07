import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToastStore } from '@/store/useToastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastProvider() {
  const toasts = useToastStore(s => s.toasts);
  const removeToast = useToastStore(s => s.removeToast);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-24 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        
        return (
          <div 
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] 
              backdrop-blur-xl border animate-in slide-in-from-bottom-5 fade-in duration-300
              ${isSuccess ? 'bg-green-50/80 border-green-200 text-green-800' : 
                isError ? 'bg-red-50/80 border-red-200 text-red-800' : 
                'bg-white/80 border-slate-200 text-slate-800'}
            `}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />}
            {isError && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            
            <span className="text-[13px] font-bold tracking-tight">
              {toast.message}
            </span>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
