import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mic, X, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useToastStore } from '@/store/useToastStore';
import { voiceService } from '@/services/voiceService';
import { extractDataFromVoice, VoiceExtractResult } from '@/services/aiService';
import { addTransaction } from '@/services/transactionService';
import { getCategoryStyle } from '@/utils/categoryStyles';
import * as Icons from 'lucide-react';

export default function VoiceCommandModal() {
  const isVoiceModalOpen = useAppStore(s => s.isVoiceModalOpen);
  const setVoiceModalOpen = useAppStore(s => s.setVoiceModalOpen);
  const user = useAuthStore(s => s.user);
  const wallets = useWalletStore(s => s.wallets);
  const appCategories = useAppStore(s => s.appCategories);
  const showToast = useToastStore(s => s.showToast);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<VoiceExtractResult | null>(null);

  const mainWallet = wallets.find(w => w.isMain) || wallets[0];

  useEffect(() => {
    if (isVoiceModalOpen) {
      startListening();
    } else {
      voiceService.stop();
      resetState();
    }
  }, [isVoiceModalOpen]);

  const resetState = () => {
    setIsListening(false);
    setTranscript('');
    setIsProcessing(false);
    setError('');
    setParsedData(null);
  };

  const handleClose = () => {
    voiceService.stop();
    setVoiceModalOpen(false);
  };

  const startListening = () => {
    if (!voiceService.isSupported()) {
      setError('เบราว์เซอร์ของคุณไม่รองรับการสั่งงานด้วยเสียง (Web Speech API)');
      return;
    }

    resetState();
    
    voiceService.start(
      (result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          handleProcessVoice(result.transcript);
        }
      },
      (err) => {
        setError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
    setIsListening(true);
  };

  const handleProcessVoice = async (text: string) => {
    if (!text.trim()) {
      setError('ไม่ได้ยินเสียง กรุณาลองใหม่อีกครั้ง');
      return;
    }
    
    setIsProcessing(true);
    voiceService.stop();

    try {
      const result = await extractDataFromVoice(text);
      setParsedData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์ข้อความ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !parsedData || !parsedData.amount) {
      showToast('ข้อมูลไม่ครบถ้วน กรุณาลองพูดใหม่อีกครั้ง', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const categoryToUse = parsedData.category || 'อื่นๆ';

      await addTransaction(user.uid, {
        type: parsedData.type || 'expense',
        amount: parsedData.amount,
        title: parsedData.title || 'รายการด้วยเสียง',
        category: categoryToUse as any,
        date: dateStr,
        time: timeStr,
        note: `บันทึกด้วยเสียง: "${transcript}"`,
        walletId: mainWallet?.id,
      });

      showToast('บันทึกรายการด้วยเสียงสำเร็จ', 'success');
      setVoiceModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isVoiceModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[40px] p-8 shadow-[0_32px_64px_rgba(46,16,101,0.2)] border border-white/60 animate-in zoom-in-95 fade-in duration-300 overflow-hidden flex flex-col items-center min-h-[400px] justify-between">
        
        {/* Glow Background Effect */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[60px] opacity-20 pointer-events-none transition-all duration-700 ${isListening ? 'bg-indigo-500 scale-150 animate-pulse' : 'bg-[#A855F7] scale-100'}`} />

        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 w-full flex flex-col items-center justify-center z-10 relative mt-8">
          
          {/* Main Visual Indicator */}
          {!parsedData && !error ? (
            <div className="flex flex-col items-center w-full">
              <div 
                className={`relative w-28 h-28 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${isListening ? 'bg-indigo-600 scale-110 shadow-indigo-500/50' : 'bg-slate-800'}`}
                onClick={isListening ? () => voiceService.stop() : startListening}
              >
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" style={{ animationDuration: '2s' }} />
                )}
                {isProcessing ? (
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </div>
              
              <h3 className="mt-8 text-[22px] font-bold text-[#2E1065] text-center">
                {isProcessing ? 'กำลังวิเคราะห์ด้วย AI...' : isListening ? 'กำลังฟัง...' : 'แตะเพื่อพูด'}
              </h3>
              
              <div className="mt-4 min-h-[60px] w-full flex items-center justify-center px-4">
                <p className={`text-center text-lg font-medium ${transcript ? 'text-[#2E1065]' : 'text-slate-400'}`}>
                  {transcript || '"จ่ายค่าเน็ตบ้าน 500 บาท"'}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <AlertCircle className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-[#2E1065] mb-2 text-center">เกิดข้อผิดพลาด</h3>
              <p className="text-sm text-[#2E1065]/60 text-center px-4 mb-8">{error}</p>
              <button 
                onClick={startListening}
                className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                ลองอีกครั้ง
              </button>
            </div>
          ) : parsedData ? (
            <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 text-white">
                <Check className="w-8 h-8" />
              </div>
              
              <div className="w-full bg-white/80 backdrop-blur p-5 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">ยอดเงิน</span>
                  <span className={`text-2xl font-black ${parsedData.type === 'income' ? 'text-emerald-600' : 'text-[#2E1065]'}`}>
                    {parsedData.type === 'income' ? '+' : '-'}฿{parsedData.amount?.toLocaleString() || '0'}
                  </span>
                </div>
                
                <div className="h-[1px] w-full bg-slate-100" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">รายการ</span>
                  <span className="text-base font-bold text-[#2E1065]">{parsedData.title}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">หมวดหมู่</span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const catName = parsedData.category || 'อื่นๆ';
                      const dbCat = appCategories?.[catName];
                      const style = getCategoryStyle(catName, parsedData.type || 'expense', dbCat);
                      const IconComponent = (Icons as any)[style.icon] || Icons.HelpCircle;
                      return (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                          <IconComponent className={`w-4 h-4 ${style.textColor}`} />
                          <span className="text-sm font-bold text-[#2E1065]">{catName}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="w-full flex gap-3">
                <button 
                  onClick={startListening}
                  className="flex-1 py-3.5 rounded-[18px] font-bold text-[15px] text-[#2E1065]/70 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" /> พูดใหม่
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="flex-[2] py-3.5 rounded-[18px] font-bold text-[15px] bg-gradient-to-r from-[#A855F7] to-[#6D28D9] hover:opacity-90 text-white transition-all active:scale-95 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isProcessing ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
                </button>
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </div>,
    document.body
  );
}
