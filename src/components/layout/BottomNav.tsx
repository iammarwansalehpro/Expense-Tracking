import { 
  Home, 
  BarChart3, 
  Wallet, 
  User,
  Plus,
  PenLine,
  ScanLine,
  Loader2,
  ArrowLeftRight,
  Mic
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { PageId } from '@/types';
import { extractDataFromSlip } from '@/services/ocrService';
import AnimatedDots from '@/components/ui/AnimatedDots';

export default function BottomNav() {
  const currentPage = useAppStore((s) => s.currentPage);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const isAddMenuOpen = useAppStore((s) => s.isAddMenuOpen);
  const setAddMenuOpen = useAppStore((s) => s.setAddMenuOpen);
  const setScannedSlips = useAppStore((s) => s.setScannedSlips);
  const setReviewModalOpen = useAppStore((s) => s.setReviewModalOpen);
  const isSettingsModalOpen = useAppStore((s) => s.isSettingsModalOpen);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanImageUrl, setScanImageUrl] = useState<string | null>(null);
  const { t } = useTranslation();
  const [scanText, setScanText] = useState(t('scanner.preparing'));
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (!isScanning) return;
    
    const texts = [
      t('scanner.preparing'),
      t('scanner.reading'),
      t('scanner.analyzing'),
      t('scanner.extracting'),
      t('scanner.categorizing'),
      t('scanner.verifying')
    ];
    let step = 0;
    
    const interval = setInterval(() => {
      step = (step + 1) % texts.length;
      setScanText(texts[step]);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isScanning]);


  const navItems = [
    { id: 'home', icon: Home, index: 0 },
    { id: 'overview', icon: BarChart3, index: 1 },
    { id: 'empty', icon: null, index: 2 }, // Placeholder for FAB
    { id: 'statistics', icon: Wallet, index: 3 },
    { id: 'settings', icon: User, index: 4 },
  ];

  const activeIndex = navItems.find(i => i.id === currentPage)?.index || 0;

  const handleScanClick = () => {
    setAddMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setScanProgress({ current: 1, total: files.length });
    setScanText("กำลังเตรียมไฟล์...");
    setIsScanning(true);
    
    try {
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Update image preview and progress for the current file
        setScanImageUrl(URL.createObjectURL(file));
        setScanProgress({ current: i + 1, total: files.length });
        
        const data = await extractDataFromSlip(file);
        
        let bankStr = data.bank || 'Slip';

        results.push({
          amount: data.amount,
          date: data.date,
          title: data.title,
          rawText: data.rawText,
          imageUrl: URL.createObjectURL(file), // Reuse the URL
          bank: bankStr,
          category: data.category || '',
          note: ''
        });
      }
      
      setScannedSlips(results);
      
      // Open the new Review Modal
      setReviewModalOpen(true);
    } catch (error: any) {
      console.error("Scan error:", error);
      if (error?.message?.includes('429') || String(error).includes('429')) {
        alert("โควต้าสแกนสลิปเต็มชั่วคราว (Rate Limit)\nกรุณารอ 1 นาทีแล้วสแกนใหม่อีกครั้งครับ");
      } else {
        alert("สแกนสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือเพิ่มข้อมูลด้วยตนเอง");
      }
    } finally {
      setIsScanning(false);
      // Reset input so the same files can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Speed Dial Full-screen Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/30 z-[45] transition-opacity duration-300 backdrop-blur-[4px] ${isAddMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setAddMenuOpen(false)}
      />

      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isSettingsModalOpen ? 'translate-y-[200%] opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="max-w-md mx-auto relative pointer-events-auto">

          {/* Speed Dial Menu (Smart-Delivery Style) */}
          <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-4 z-50 pointer-events-auto transition-all duration-300 ${
            isAddMenuOpen ? 'bottom-[120px]' : 'bottom-[80px] pointer-events-none'
          }`}>
            
            {/* Option 1: Scan Slip (Icon: ScanLine) */}
            <div className={`relative flex items-center justify-center w-[52px] h-[52px] group transition-all duration-300 delay-[0ms] ${isAddMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 flex items-center">
                <div
                  className="px-4 py-2 bg-white/50 dark:bg-[#1E1035]/90 backdrop-blur-[40px] saturate-[200%] rounded-[20px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/15 cursor-pointer hover:bg-white/70 dark:hover:bg-[#1E1035] hover:-translate-y-0.5 transition-all duration-300"
                  onClick={handleScanClick}
                >
                  <div className="flex flex-col items-end text-right w-max max-w-[125px] whitespace-normal break-words">
                    <span className="text-[13px] font-bold text-[#2E1065] dark:text-white drop-shadow-sm leading-tight">{t('nav.scanSlipTitle')}</span>
                    <span className="text-[10px] font-medium text-[#2E1065]/70 dark:text-white/70 leading-tight">{t('nav.scanSlipDesc')}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleScanClick}
                className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center backdrop-blur-xl shadow-[0_8px_32px_rgba(16,185,129,0.3)] border bg-gradient-to-tr from-emerald-400 to-emerald-500 border-white/30 text-white transition-all duration-300 active:scale-90 hover:scale-110 hover:-translate-y-1 shrink-0"
              >
                <ScanLine className="w-[22px] h-[22px] relative z-10" />
              </button>
            </div>

            {/* Option 2: Add Manual (Icon: PenLine) */}
            <div className={`relative flex items-center justify-center w-[52px] h-[52px] group transition-all duration-300 delay-[50ms] ${isAddMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 flex items-center">
                <div
                  className="px-4 py-2 bg-white/50 dark:bg-[#1E1035]/90 backdrop-blur-[40px] saturate-[200%] rounded-[20px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/15 cursor-pointer hover:bg-white/70 dark:hover:bg-[#1E1035] hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => {
                    setCurrentPage('add');
                    setAddMenuOpen(false);
                  }}
                >
                  <div className="flex flex-col items-end text-right w-max max-w-[125px] whitespace-normal break-words">
                    <span className="text-[13px] font-bold text-[#2E1065] dark:text-white drop-shadow-sm leading-tight">{t('nav.addManualTitle')}</span>
                    <span className="text-[10px] font-medium text-[#2E1065]/70 dark:text-white/70 leading-tight">{t('nav.addManualDesc')}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setCurrentPage('add');
                  setAddMenuOpen(false);
                }}
                className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center backdrop-blur-xl shadow-[0_8px_32px_rgba(236,72,153,0.3)] border bg-gradient-to-tr from-pink-500 to-rose-500 border-white/30 text-white transition-all duration-300 active:scale-90 hover:scale-110 hover:-translate-y-1 shrink-0"
              >
                <PenLine className="w-[22px] h-[22px] relative z-10" />
              </button>
            </div>

            {/* Option 3: Transfer (Icon: ArrowLeftRight) */}
            <div className={`relative flex items-center justify-center w-[52px] h-[52px] group transition-all duration-300 delay-[100ms] ${isAddMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 flex items-center">
                <div
                  className="px-4 py-2 bg-white/50 dark:bg-[#1E1035]/90 backdrop-blur-[40px] saturate-[200%] rounded-[20px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/15 cursor-pointer hover:bg-white/70 dark:hover:bg-[#1E1035] hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => {
                    useAppStore.getState().setTransferModalOpen(true);
                    setAddMenuOpen(false);
                  }}
                >
                  <div className="flex flex-col items-end text-right w-max max-w-[125px] whitespace-normal break-words">
                    <span className="text-[13px] font-bold text-[#2E1065] dark:text-white drop-shadow-sm leading-tight">{t('nav.transferTitle', 'โอนเงิน')}</span>
                    <span className="text-[10px] font-medium text-[#2E1065]/70 dark:text-white/70 leading-tight">{t('nav.transferDesc', 'โอนข้ามกระเป๋า')}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  useAppStore.getState().setTransferModalOpen(true);
                  setAddMenuOpen(false);
                }}
                className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center backdrop-blur-xl shadow-[0_8px_32px_rgba(249,115,22,0.3)] border bg-gradient-to-tr from-amber-400 to-orange-500 border-white/30 text-white transition-all duration-300 active:scale-90 hover:scale-110 hover:-translate-y-1 shrink-0"
              >
                <ArrowLeftRight className="w-[22px] h-[22px] relative z-10" />
              </button>
            </div>

            {/* Option 4: Voice Command (Icon: Mic) */}
            <div className={`relative flex items-center justify-center w-[52px] h-[52px] group transition-all duration-300 delay-[150ms] ${isAddMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 flex items-center">
                <div
                  className="px-4 py-2 bg-white/50 dark:bg-[#1E1035]/90 backdrop-blur-[40px] saturate-[200%] rounded-[20px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/15 cursor-pointer hover:bg-white/70 dark:hover:bg-[#1E1035] hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => {
                    useAppStore.getState().setVoiceModalOpen(true);
                    setAddMenuOpen(false);
                  }}
                >
                  <div className="flex flex-col items-end text-right w-max max-w-[125px] whitespace-normal break-words">
                    <span className="text-[13px] font-bold text-[#2E1065] dark:text-white drop-shadow-sm leading-tight">{t('nav.voiceCommandTitle', 'สั่งงานด้วยเสียง')}</span>
                    <span className="text-[10px] font-medium text-[#2E1065]/70 dark:text-white/70 leading-tight">{t('nav.voiceCommandDesc', 'พูดเพื่อบันทึกรายการ')}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  useAppStore.getState().setVoiceModalOpen(true);
                  setAddMenuOpen(false);
                }}
                className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center backdrop-blur-xl shadow-[0_8px_32px_rgba(168,85,247,0.3)] border bg-gradient-to-tr from-[#A855F7] to-[#6D28D9] border-white/30 text-white transition-all duration-300 active:scale-90 hover:scale-110 hover:-translate-y-1 shrink-0"
              >
                <Mic className="w-[22px] h-[22px] relative z-10" />
              </button>
            </div>

          </div>

          {/* Floating Navigation Bar (Glassmorphism) */}
          <div className="bg-white/40 dark:bg-[#1E1035]/80 backdrop-blur-[24px] saturate-[180%] h-16 shadow-[0_8px_32px_rgba(31,38,135,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 rounded-[2rem] border border-white/60 dark:border-white/10 px-2 transition-colors duration-500">
            <div className="grid grid-cols-5 h-full relative items-center">
              
              {/* Animated Active Pill */}
              <div 
                className="absolute h-12 bg-white/60 dark:bg-white/15 rounded-full transition-all duration-300 ease-out z-0 shadow-sm border border-white/60 dark:border-white/10"
                style={{ 
                  width: 'calc(20% - 10px)', 
                  left: `calc(${activeIndex * 20}% + 5px)`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />

              {navItems.map((item) => {
                if (item.id === 'empty') {
                  return <div key="empty" className="w-full h-full" />;
                }
                
                const Icon = item.icon!;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as PageId)}
                    className={`w-full h-full flex flex-col items-center justify-center relative z-10 transition-colors duration-300 ${
                      isActive ? 'text-[#2E1065] dark:text-purple-200' : 'text-[#2E1065]/40 dark:text-white/40 hover:text-[#2E1065]/70 dark:hover:text-white/70'
                    }`}
                  >
                    <Icon 
                      className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                  </button>
                );
              })}
            </div>

            {/* Floating Action Button (FAB) - Glassmorphism */}
            <button
              onClick={() => setAddMenuOpen(!isAddMenuOpen)}
              className={`absolute left-1/2 -translate-x-1/2 -top-6 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_8px_32px_rgba(139,92,246,0.3)] z-50 transition-all duration-300 ease-out border border-white/40 backdrop-blur-md ${
                isAddMenuOpen ? 'rotate-[135deg] bg-gradient-to-tr from-pink-400 to-rose-400' : 'bg-gradient-to-tr from-[#A855F7] to-[#8B5CF6] hover:scale-105'
              }`}
            >
              <Plus className="w-7 h-7" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        id="slip-upload"
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Premium Scanning Overlay (Glassmorphism & Scanner Animation) */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-white/95 p-6 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white flex flex-col items-center overflow-hidden relative">
            
            {/* Multi-slip progress indicator */}
            {scanProgress.total > 1 && (
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#8B5CF6]/20 shadow-sm z-30">
                <span className="text-xs font-bold text-[#8B5CF6]">
                  {scanProgress.current} / {scanProgress.total}
                </span>
              </div>
            )}
            
            {/* Cool Scanning Animation Container */}
            <div className="relative w-48 h-64 bg-slate-100 rounded-2xl overflow-hidden mb-8 shadow-inner border border-slate-200 isolate">
              {scanImageUrl ? (
                <img src={scanImageUrl} alt="Scanning preview" className="w-full h-full object-cover opacity-70" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <ScanLine className="w-12 h-12 text-slate-400" />
                </div>
              )}
              
              {/* Overlay darkener */}
              <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
              
              {/* Laser Line */}
              <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent shadow-[0_0_15px_#A855F7] animate-[scan_2s_ease-in-out_infinite] z-20" />
              
              {/* Laser Glow */}
              <div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-[#A855F7]/30 to-transparent animate-[scan-glow_2s_ease-in-out_infinite] z-10" />
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex items-center gap-2 text-[#8B5CF6] bg-[#8B5CF6]/10 px-4 py-2 rounded-full">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-bold text-lg tracking-tight">กำลังประมวลผล</span>
              </div>
              <p className="text-[#2E1065]/70 font-medium h-6 transition-all duration-300 animate-pulse text-[15px] flex items-baseline justify-center">
                <span>{scanProgress.total > 1 ? `สลิปที่ ${scanProgress.current} - ${scanText}` : scanText}</span>
                <AnimatedDots />
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
