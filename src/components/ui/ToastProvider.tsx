import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToastStore } from '@/store/useToastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastProvider() {
  const toasts = useToastStore(s => s.toasts);
  const removeToast = useToastStore(s => s.removeToast);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-12 md:top-8 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        
        return (
          <div 
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-full shadow-[0_12px_40px_rgba(31,38,135,0.15)] 
              backdrop-blur-2xl border transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${toast.isLeaving 
                ? 'opacity-0 -translate-y-8 scale-90 blur-sm' 
                : 'animate-in slide-in-from-top-10 fade-in zoom-in-95'}
              ${isSuccess ? 'bg-green-50/90 dark:bg-green-900/40 border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-300' : 
                isError ? 'bg-red-50/90 dark:bg-red-900/40 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300' : 
                'bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200'}
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
