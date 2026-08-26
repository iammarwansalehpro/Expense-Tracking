import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mic, X, Check, Loader2, Sparkles, AlertCircle, Edit2, ChevronDown, Calendar, CreditCard, FileText, PlusCircle, MinusCircle, AlignLeft, Pencil } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useToastStore } from '@/store/useToastStore';
import { voiceService } from '@/services/voiceService';
import { extractDataFromVoice, type VoiceExtractResult } from '@/services/aiService';
import { addTransaction } from '@/services/transactionService';
import { getCategoryStyle, getCategoryDisplayName } from '@/utils/categoryStyles';
import { useDragToClose } from '@/hooks/useDragToClose';
import { useTranslation } from '@/hooks/useTranslation';
import CategorySelectModal from '@/components/ui/CategorySelectModal';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomTimePicker from '@/components/ui/CustomTimePicker';
import CustomSelect from '@/components/ui/CustomSelect';
import AutoShrinkText from '@/components/ui/AutoShrinkText';
import * as Icons from 'lucide-react';

function AnimatedVoiceTranscript({ text, isProcessing, isListening }: { text: string; isProcessing: boolean; isListening: boolean }) {
  const [displayedText, setDisplayedText] = useState('');
  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }

    let i = displayedText.length;
    const interval = setInterval(() => {
      const currentTarget = textRef.current;
      if (i < currentTarget.length) {
        setDisplayedText(currentTarget.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 py-2 animate-fade-in">
      <div className="relative max-w-md text-center flex flex-wrap items-center justify-center">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-relaxed bg-clip-text text-transparent bg-gradient-to-r from-[#2E1065] to-[#6D28D9] dark:from-white dark:to-white/70 drop-shadow-sm">
          &ldquo;{displayedText || text}&rdquo;
          {(isListening || isProcessing) && (
            <span className="inline-block w-[3px] h-[22px] ml-1 bg-[#8B5CF6] dark:bg-[#A78BFA] animate-blink align-middle translate-y-[-2px] rounded-full" />
          )}
        </h2>
      </div>
    </div>
  );
}

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
  const timeoutRef = useRef<any>(null);

  const mainWallet = wallets.find(w => w.isMain) || wallets[0];
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
  const [walletId, setWalletId] = useState<string>(mainWallet?.id || '');

  const resetState = () => {
    setIsListening(false);
    setTranscript('');
    setIsProcessing(false);
    setError('');
    setParsedData(null);
    setIsCategoryModalOpen(false);

    // Reset date, time, and wallet to fresh initial defaults
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
    const defaultWallet = wallets.find(w => w.isMain) || wallets[0];
    setWalletId(defaultWallet ? defaultWallet.id : '');
  };

  useEffect(() => {
    if (wallets && wallets.length > 0 && !walletId && mainWallet) {
      setWalletId(mainWallet.id);
    }
  }, [wallets, walletId, mainWallet]);

  const { handlers: dragHandlers, style: dragStyle } = useDragToClose({
    onClose: () => {
      voiceService.stop();
      resetState();
      setVoiceModalOpen(false);
    },
  });

  useEffect(() => {
    if (isVoiceModalOpen) {
      startListening();
    } else {
      voiceService.stop();
      resetState();
    }
  }, [isVoiceModalOpen]);

  const handleClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    voiceService.stop();
    resetState();
    setVoiceModalOpen(false);
  };

  const startListening = () => {
    if (!voiceService.isSupported()) {
      setError(t('voice.browserNotSupport', 'เบราว์เซอร์ของคุณไม่รองรับการสั่งงานด้วยเสียง (Web Speech API)'));
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
        console.error('Speech API Error:', err);
        setError(t('voice.micError', 'ไม่สามารถรับเสียงได้ กรุณาตรวจสอบไมโครโฟนของคุณ'));
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
      setError(t('voice.noVoiceError', 'ไม่ได้ยินเสียง กรุณาลองใหม่อีกครั้ง'));
      return;
    }
    
    setIsProcessing(true);
    voiceService.stop();

    try {
      const result = await extractDataFromVoice(text, wallets);
      setParsedData(result);

      // Auto-select detected wallet if found, otherwise reset/ensure main wallet is selected
      const defaultWallet = wallets.find(w => w.isMain) || wallets[0];
      if (result.walletId && wallets.some(w => w.id === result.walletId)) {
        setWalletId(result.walletId);
      } else {
        setWalletId(defaultWallet ? defaultWallet.id : '');
      }
    } catch (err: any) {
      console.error('Voice Processing Error:', err);
      setError(t('voice.processError', 'ระบบไม่สามารถประมวลผลคำสั่งเสียงของคุณได้ในขณะนี้ กรุณาลองพูดใหม่อีกครั้ง'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !parsedData || !parsedData.amount) {
      showToast(t('voice.incompleteError', 'ข้อมูลไม่ครบถ้วน กรุณาลองพูดใหม่อีกครั้ง'), 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const newTransaction = {
        amount: parsedData.amount,
        title: parsedData.title || 'Voice Transaction',
        type: parsedData.type as any || 'expense',
        category: parsedData.category || 'อื่นๆ',
        date: date,
        time: time,
        walletId: walletId || mainWallet?.id || '',
        note: `${t('voice.voiceNotePrefix', 'บันทึกด้วยเสียง')}: "${transcript}"`,
      };

      await addTransaction(user.uid, newTransaction);

      showToast(t('voice.saveSuccess', 'บันทึกรายการด้วยเสียงสำเร็จ'), 'success');
      resetState();
      setVoiceModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showToast(t('voice.saveError', 'เกิดข้อผิดพลาดในการบันทึก'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isVoiceModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      <div 
        {...dragHandlers}
        style={dragStyle}
        className="bg-white/80 backdrop-blur-[30px] rounded-t-[40px] border-t border-white/60 w-full max-w-md mx-auto shadow-[0_-10px_40px_rgba(31,38,135,0.15)] relative animate-slide-up flex flex-col h-[95vh]"
      >
        
        {/* Drag Handle */}
        <div className="p-4 flex justify-center shrink-0">
          <div className="w-16 h-1.5 bg-slate-300/50 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex justify-between items-center shrink-0 z-20">
          <h2 className="text-[26px] font-bold text-[#2E1065] flex items-center gap-2 tracking-tight">
            <Mic className="w-6 h-6 text-[#8B5CF6]" />
            {t('voice.title', 'สั่งงานด้วยเสียง')}
          </h2>
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white/60 shadow-sm border border-white/50 flex items-center justify-center text-[#2E1065]/60 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className={`overflow-y-auto px-6 pb-40 no-scrollbar flex-1 flex flex-col ${!parsedData ? 'items-center justify-center' : ''}`}>
        
        {/* Glow Background Effect */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[60px] opacity-20 pointer-events-none transition-all duration-700 ${isListening || isProcessing ? 'bg-indigo-500 scale-150 animate-pulse' : 'bg-[#A855F7] scale-100'}`} />

        <div className={`flex-1 w-full flex flex-col z-10 relative ${!parsedData ? 'items-center justify-center' : 'pt-4'}`}>
          
          {/* Main Visual Indicator */}
          {!parsedData && !error && (
            <div className="flex flex-col items-center w-full">
              <div 
                className={`relative w-28 h-28 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer ${
                  isListening || isProcessing 
                    ? 'bg-indigo-600 scale-110 shadow-indigo-500/50' 
                    : 'bg-slate-800 hover:bg-slate-700 hover:scale-105'
                }`}
                onClick={isListening ? () => voiceService.stop() : isProcessing ? undefined : startListening}
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
                {isProcessing ? t('voice.processing', 'กำลังประมวลผล...') : isListening ? t('voice.listening', 'กำลังฟัง...') : t('voice.tapToSpeak', 'แตะเพื่อพูด')}
              </h3>
              
              <div className="mt-4 min-h-[60px] w-full flex flex-col items-center justify-center px-4">
                {transcript ? (
                  <AnimatedVoiceTranscript 
                    text={transcript} 
                    isProcessing={isProcessing} 
                    isListening={isListening} 
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-500 gap-1.5 text-center">
                    <span className="font-bold text-sm text-[#2E1065]">
                      {t('voice.speakHint', 'พูดชื่อรายการ ยอดเงิน และกระเป๋าเงิน')}
                    </span>
                    <div className="flex flex-col gap-1 text-xs opacity-75 mt-1">
                      <span>{t('voice.example', 'เช่น "กินข้าว 150 เงินสด"')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center w-full">
              <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <AlertCircle className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-[#2E1065] mb-2 text-center">{t('voice.errorTitle', 'เกิดข้อผิดพลาด')}</h3>
              <p className="text-sm text-[#2E1065]/60 text-center px-4 mb-8">{error}</p>
              <button 
                onClick={startListening}
                className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95"
              >
                {t('voice.tryAgain', 'ลองอีกครั้ง')}
              </button>
            </div>
          )}
          
          {parsedData && (
            <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-4 duration-500 mt-4">
              <div className="flex justify-between items-end mb-8 relative w-full">
                <div className="flex gap-4 w-full">
                  <button 
                    type="button"
                    onClick={() => setParsedData(prev => prev ? {...prev, type: 'income'} : null)}
                    className={`flex-1 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm border ${
                      parsedData.type === 'income' ? 'bg-white/80 border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.1)]' : 'bg-white/30 border-white/40 hover:bg-white/40 backdrop-blur-md'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-[16px] shadow-sm flex items-center justify-center border border-white/50 transition-colors ${parsedData.type === 'income' ? 'bg-emerald-500/10' : 'bg-white/50'}`}>
                      <PlusCircle className={`w-6 h-6 ${parsedData.type === 'income' ? 'text-emerald-500' : 'text-[#2E1065]/40'}`} />
                    </div>
                    <span className={`font-bold text-sm ${parsedData.type === 'income' ? 'text-emerald-600' : 'text-[#2E1065]/60'}`}>{t('add.income', 'รายรับ')}</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setParsedData(prev => prev ? {...prev, type: 'expense'} : null)}
                    className={`flex-1 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm border ${
                      parsedData.type === 'expense' ? 'bg-white/80 border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.1)]' : 'bg-white/30 border-white/40 hover:bg-white/40 backdrop-blur-md'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-[16px] shadow-sm flex items-center justify-center border border-white/50 transition-colors ${parsedData.type === 'expense' ? 'bg-[#F43F5E]/10' : 'bg-white/50'}`}>
                      <MinusCircle className={`w-6 h-6 ${parsedData.type === 'expense' ? 'text-[#F43F5E]' : 'text-[#2E1065]/40'}`} />
                    </div>
                    <span className={`font-bold text-sm ${parsedData.type === 'expense' ? 'text-[#F43F5E]' : 'text-[#2E1065]/60'}`}>{t('add.expense', 'รายจ่าย')}</span>
                  </button>
                </div>
              </div>
              <div className="w-full bg-white/40 backdrop-blur-xl p-5 rounded-[32px] border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.05)] mb-6 flex flex-col gap-4 text-left">
                
                {/* 1. Date & Time */}
                <div>
                  <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                      <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    {t('add.dateTime', 'วันที่และเวลา')}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-[5]">
                      <CustomDatePicker value={date} onChange={setDate} />
                    </div>
                    <div className="flex-[3]">
                      <CustomTimePicker value={time} onChange={setTime} />
                    </div>
                  </div>
                </div>

                {/* 2. Wallet */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                        <CreditCard className="w-4 h-4 text-[#8B5CF6]" />
                      </div>
                      {t('add.wallet')}
                    </label>
                    {parsedData?.walletId && parsedData.walletId === walletId && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] text-[11px] font-bold border border-[#8B5CF6]/20 shadow-sm animate-fade-in">
                        <span>{t('voice.detectedWallet', 'ตรวจพบจากเสียง')}</span>
                      </span>
                    )}
                  </div>
                  <CustomSelect 
                    value={walletId}
                    disabled={parsedData.type === 'transfer'}
                    onChange={setWalletId}
                    options={wallets
                      .filter(w => parsedData.type !== 'income' || w.type !== 'credit_card')
                      .map(w => {
                      const iconName = w.icon === 'CreditCard' ? 'Landmark' : w.icon;
                      const WIcon = (Icons as any)[iconName] || Icons.Wallet;
                      return {
                        label: w.name,
                        value: w.id,
                        iconNode: <WIcon className={`w-4 h-4 ${w.color.replace('bg-', 'text-')}`} />
                      };
                    })}
                    placeholder="เลือกกระเป๋าเงิน"
                  />
                </div>

                {/* 3. Category */}
                <div>
                  <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                      <FileText className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    {t('add.category')}
                  </label>
                  <button 
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-[16px] px-4 py-3.5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 transition-all shadow-inner min-h-[60px]"
                  >
                    <span className="flex items-center gap-3 font-bold text-[#2E1065] overflow-hidden">
                      {(() => {
                        const catName = parsedData.category || 'อื่นๆ';
                        const style = getCategoryStyle(catName, appCategories || undefined);
                        const IconComponent = style.icon;
                        return (
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm ${style.color} ${style.textColor} shrink-0`}>
                             <IconComponent className="w-4 h-4" />
                          </div>
                        );
                      })()}
                      <AutoShrinkText origin="left">{getCategoryDisplayName(parsedData.category || 'อื่นๆ', language)}</AutoShrinkText>
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                      <PlusCircle className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                  </button>
                </div>

                {/* 4. Amount */}
                <div>
                  <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                      <AlignLeft className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    {t('add.amount', 'จำนวนเงิน')}
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${parsedData.type === 'income' ? 'text-emerald-600' : parsedData.type === 'expense' ? 'text-rose-500' : 'text-[#2E1065]/50'}`}>
                      {parsedData.type === 'income' ? '+' : parsedData.type === 'expense' ? '-' : ''}฿
                    </span>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={parsedData.amount || ''}
                      onChange={e => setParsedData({...parsedData, amount: Number(e.target.value)})}
                      className={`w-full bg-white/60 backdrop-blur-sm rounded-[16px] px-10 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 border border-white/50 shadow-inner ${parsedData.type === 'income' ? 'text-emerald-600 placeholder:text-emerald-600/50' : parsedData.type === 'expense' ? 'text-rose-500 placeholder:text-rose-500/50' : 'text-[#2E1065] placeholder:text-[#2E1065]/40'}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* 5. Title/Memo */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                        <Pencil className="w-4 h-4 text-[#8B5CF6]" />
                      </div>
                      {t('add.memo', 'บันทึกช่วยจำ')}
                    </label>
                    <span className={`text-xs font-semibold ${(parsedData.title || '').length >= 50 ? 'text-red-500' : 'text-[#2E1065]/40'}`}>
                      {(parsedData.title || '').length}/50
                    </span>
                  </div>
                  <textarea 
                    maxLength={50}
                    rows={3}
                    value={parsedData.title || ''}
                    onChange={e => setParsedData({...parsedData, title: e.target.value})}
                    className="w-full bg-white/60 backdrop-blur-sm rounded-[16px] px-4 py-3.5 text-[#2E1065] font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 border border-white/50 shadow-inner resize-none min-h-[100px] placeholder:text-[#2E1065]/30"
                    placeholder="เพิ่มบันทึกช่วยจำ..."
                  />
                </div>
              </div>
            </div>
          )}

          </div>
        </div>

        {/* Sticky Footer Buttons */}
        {parsedData && (
          <div className="absolute bottom-0 left-0 right-0 p-5 flex z-10 pointer-events-none">
            <div className="w-full flex gap-3 pointer-events-auto">
              <button 
                onClick={startListening}
                className="flex-1 py-4 rounded-[24px] font-bold text-lg text-[#2E1065]/70 bg-white shadow-[0_8px_20px_rgba(31,38,135,0.05)] border border-white/50 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Mic className="w-5 h-5" /> {t('voice.speakAgain', 'พูดใหม่')}
              </button>
              <button 
                onClick={handleSave}
                disabled={isProcessing}
                className={`flex-[2] py-4 rounded-[24px] font-bold text-lg text-white shadow-[0_8px_20px_rgba(31,38,135,0.15)] border border-white/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                  parsedData.type === 'income' ? 'bg-gradient-to-tr from-emerald-400 to-emerald-500 hover:opacity-90' : 'bg-gradient-to-tr from-orange-400 to-rose-500 hover:opacity-90'
                }`}
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {isProcessing ? t('voice.saving', 'กำลังบันทึก...') : t('voice.saveTx', 'บันทึกรายการ')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

      <CategorySelectModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelect={(catName: string) => {
          setParsedData(prev => prev ? { ...prev, category: catName } : null);
          setIsCategoryModalOpen(false);
        }}
        type={parsedData?.type || 'expense'}
        selectedCategory={parsedData?.category || ''}
      />
    </div>,
    document.body
  );
}
