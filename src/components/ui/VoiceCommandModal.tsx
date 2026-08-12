import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mic, X, Check, Loader2, Sparkles, AlertCircle, Edit2, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useToastStore } from '@/store/useToastStore';
import { voiceService } from '@/services/voiceService';
import { extractDataFromVoice, type VoiceExtractResult } from '@/services/aiService';
import { addTransaction } from '@/services/transactionService';
import { getCategoryStyle } from '@/utils/categoryStyles';
import { useDragToClose } from '@/hooks/useDragToClose';
import { useTranslation } from '@/hooks/useTranslation';
import CategorySelectModal from '@/components/ui/CategorySelectModal';
import * as Icons from 'lucide-react';

export default function VoiceCommandModal() {
  const { t, language } = useTranslation();
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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { handlers: dragHandlers, style: dragStyle } = useDragToClose({
    onClose: () => {
      voiceService.stop();
      setVoiceModalOpen(false);
    },
  });

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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
      language === 'en' ? 'en-US' : 'th-TH',
      (result) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            handleProcessVoice(result.transcript);
          }, 1500);
        } else {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      />
      <div 
        className="relative w-full max-w-full sm:max-w-md bg-white/90 backdrop-blur-2xl rounded-t-[40px] sm:rounded-[40px] p-8 pb-10 sm:pb-8 shadow-[0_-8px_40px_rgba(46,16,101,0.1)] border border-white/60 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 overflow-hidden flex flex-col items-center min-h-[400px] justify-between"
        {...dragHandlers}
        style={{ ...dragStyle, touchAction: 'none' }}
      >
        
        {/* Drag Handle */}
        <div className="w-16 h-1.5 bg-slate-300/80 rounded-full mx-auto mb-6 shrink-0 shadow-sm" />
        
        {/* Glow Background Effect */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[60px] opacity-20 pointer-events-none transition-all duration-700 ${isListening ? 'bg-indigo-500 scale-150 animate-pulse' : 'bg-[#A855F7] scale-100'}`} />

        <div className="flex-1 w-full flex flex-col items-center justify-center z-10 relative">
          
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
                {isProcessing ? 'กำลังประมวลผล...' : isListening ? 'กำลังฟัง...' : 'แตะเพื่อพูด'}
              </h3>
              
              <div className="mt-4 min-h-[60px] w-full flex flex-col items-center justify-center px-4">
                {transcript ? (
                  <p className="text-center text-lg font-medium text-[#2E1065]">{transcript}</p>
                ) : (
                  <div className="flex flex-col items-center text-slate-400 gap-1 text-center">
                    <span className="font-medium">พูดชื่อรายการ และ ยอดเงิน</span>
                    <span className="text-sm opacity-80">เช่น "ซื้อของที่ 7-11 50 บาท"</span>
                  </div>
                )}
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
              
              <div className="w-full bg-white/80 backdrop-blur p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col gap-2">
                
                <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-2xl border border-transparent focus-within:border-purple-200 focus-within:bg-white transition-all">
                  <span className="text-sm font-medium text-slate-500 w-16">ยอดเงิน</span>
                  <div className="flex items-center flex-1 justify-end">
                    <span className={`text-2xl font-black mr-1 ${parsedData.type === 'income' ? 'text-emerald-600' : 'text-[#2E1065]'}`}>
                      {parsedData.type === 'income' ? '+' : '-'}฿
                    </span>
                    <input 
                      type="number"
                      value={parsedData.amount || ''}
                      onChange={e => setParsedData({...parsedData, amount: Number(e.target.value)})}
                      className={`text-2xl font-black bg-transparent outline-none w-28 text-right p-0 m-0 ${parsedData.type === 'income' ? 'text-emerald-600' : 'text-[#2E1065]'}`}
                      placeholder="0"
                    />
                    <Edit2 className="w-3.5 h-3.5 text-slate-300 ml-2 shrink-0" />
                  </div>
                </div>
                
                <div className="h-[1px] w-full bg-slate-100/80 my-0.5" />
                
                <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-2xl border border-transparent focus-within:border-purple-200 focus-within:bg-white transition-all">
                  <span className="text-sm font-medium text-slate-500 w-16">รายการ</span>
                  <div className="flex items-center flex-1 justify-end">
                    <input 
                      type="text"
                      value={parsedData.title || ''}
                      onChange={e => setParsedData({...parsedData, title: e.target.value})}
                      className="text-base font-bold text-[#2E1065] bg-transparent outline-none text-right w-full"
                      placeholder="ชื่อรายการ"
                    />
                    <Edit2 className="w-3.5 h-3.5 text-slate-300 ml-2 shrink-0" />
                  </div>
                </div>
                
                <div className="h-[1px] w-full bg-slate-100/80 my-0.5" />
                
                <div 
                  className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-2xl border border-transparent hover:bg-slate-100 transition-all cursor-pointer"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  <span className="text-sm font-medium text-slate-500 w-16 shrink-0">หมวดหมู่</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-sm font-bold text-[#2E1065] truncate max-w-[120px]">{parsedData.category || 'อื่นๆ'}</span>
                    {(() => {
                      const catName = parsedData.category || 'อื่นๆ';
                      const style = getCategoryStyle(catName, appCategories || undefined);
                      const IconComponent = style.icon;
                      return (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 bg-slate-100">
                           <IconComponent className={`w-3.5 h-3.5 ${style.textColor}`} />
                        </div>
                      );
                    })()}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300 ml-1 shrink-0" />
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
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  {isProcessing ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
                </button>
              </div>
            </div>
          ) : null}

        </div>
      </div>

      <CategorySelectModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelect={(catName, type) => {
          setParsedData(prev => prev ? { ...prev, category: catName, type } : null);
          setIsCategoryModalOpen(false);
        }}
        selectedCategory={parsedData?.category || ''}
      />
    </div>,
    document.body
  );
}
