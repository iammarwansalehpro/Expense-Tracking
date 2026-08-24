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
import { useRef, useState, useEffect, useMemo } from 'react';
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


  const navContainerRef = useRef<HTMLDivElement>(null);
  const [navWidth, setNavWidth] = useState(380);

  useEffect(() => {
    const updateWidth = () => {
      if (navContainerRef.current) {
        const w = navContainerRef.current.offsetWidth;
        if (w > 0) setNavWidth(w);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    if (navContainerRef.current) {
      ro.observe(navContainerRef.current);
    }
    window.addEventListener('resize', updateWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const { notchPath, topRimPath, cx, notchDepth, x0, x1, x2, x3 } = useMemo(() => {
    const w = navWidth;
    const h = 64;
    const r = 32; // capsule corner radius
    const center = w / 2;
    const notchR = 34; // half-width of the circular dip
    const fillet = 16; // smooth shoulder entry
    const depth = 38;  // depth of the notch dip

    const _x0 = center - notchR - fillet; // start of left shoulder
    const _x1 = center - notchR;          // start of circular dip
    const _x2 = center + notchR;          // end of circular dip
    const _x3 = center + notchR + fillet; // end of right shoulder

    const path = [
      `M ${r} 0`,
      `L ${_x0} 0`,
      `C ${_x0 + 8} 0, ${_x1 - 4} 6, ${_x1} 18`,
      `C ${_x1 + 6} 34, ${center - 14} ${depth}, ${center} ${depth}`,
      `C ${center + 14} ${depth}, ${_x2 - 6} 34, ${_x2} 18`,
      `C ${_x2 + 4} 6, ${_x3 - 8} 0, ${_x3} 0`,
      `L ${w - r} 0`,
      `A ${r} ${r} 0 0 1 ${w} ${r}`,
      `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
      `L ${r} ${h}`,
      `A ${r} ${r} 0 0 1 0 ${r}`,
      `A ${r} ${r} 0 0 1 ${r} 0`,
      'Z'
    ].join(' ');

    const rim = [
      `M ${r} 0.75`,
      `L ${_x0} 0.75`,
      `C ${_x0 + 8} 0.75, ${_x1 - 4} 6.75, ${_x1} 18.75`,
      `C ${_x1 + 6} 34.75, ${center - 14} ${depth + 0.75}, ${center} ${depth + 0.75}`,
      `C ${center + 14} ${depth + 0.75}, ${_x2 - 6} 34.75, ${_x2} 18.75`,
      `C ${_x2 + 4} 6.75, ${_x3 - 8} 0.75, ${_x3} 0.75`,
      `L ${w - r} 0.75`
    ].join(' ');

    return { 
      notchPath: path, 
      topRimPath: rim, 
      cx: center, 
      notchDepth: depth,
      x0: _x0,
      x1: _x1,
      x2: _x2,
      x3: _x3
    };
  }, [navWidth]);

  const navItems = [
    { id: 'home', icon: Home, index: 0 },
    { id: 'overview', icon: BarChart3, index: 1 },
    { id: 'empty', icon: null, index: 2 }, // Placeholder for FAB
    { id: 'statistics', icon: Wallet, index: 3 },
    { id: 'settings', icon: User, index: 4 },
  ];

  const activeItem = navItems.find(i => i.id === currentPage);
  const activeIndex = activeItem ? activeItem.index : -1;
  const isNavActive = activeIndex !== -1 && currentPage !== 'add';

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
        const previewUrl = URL.createObjectURL(file);
        // Update image preview and progress for the current file
        setScanImageUrl(previewUrl);
        setScanProgress({ current: i + 1, total: files.length });
        
        const dataList = await extractDataFromSlip(file);
        
        for (const data of dataList) {
          const bankStr = data.bank || 'Slip';
          results.push({
            amount: data.amount,
            date: data.date,
            title: data.title,
            rawText: data.rawText,
            imageUrl: previewUrl,
            bank: bankStr,
            category: data.category || '',
            note: ''
          });
        }
      }
      
      if (results.length > 0) {
        setScannedSlips(results);
        setReviewModalOpen(true);
      } else {
        alert("ไม่พบข้อมูลรายการในรูปภาพ กรุณาลองใหม่อีกครั้ง");
      }
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
        className={`fixed bottom-0 left-0 right-0 z-50 px-3.5 sm:px-6 pt-2 pb-[max(0.625rem,env(safe-area-inset-bottom,0.625rem))] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isSettingsModalOpen ? 'translate-y-[200%] opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="max-w-md mx-auto relative pointer-events-auto">

          {/* Speed Dial Menu (Smart-Delivery Style) */}
          <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-3.5 z-50 pointer-events-auto transition-all duration-300 ${
            isAddMenuOpen ? 'bottom-[96px]' : 'bottom-[64px] pointer-events-none'
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
                className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center backdrop-blur-xl shadow-[0_8px_32px_rgba(46,16,101,0.35)] border bg-gradient-to-tr from-[#2E1065] to-[#4C1D95] border-white/30 text-white transition-all duration-300 active:scale-90 hover:scale-110 hover:-translate-y-1 shrink-0"
              >
                <Mic className="w-[22px] h-[22px] relative z-10" />
              </button>
            </div>

          </div>

          {/* Floating Navigation Bar (Curved Notched Glassmorphism Cradle) */}
          <div 
            ref={navContainerRef}
            className="relative h-16 w-full filter drop-shadow-[0_10px_30px_rgba(31,38,135,0.12)] dark:drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)] transition-all duration-500"
          >
            {/* 1. Frosted Glass Fill (Clipped precisely to the Notched Silhouette) */}
            <div 
              className="absolute inset-0 bg-white/55 dark:bg-[#1E1035]/85 backdrop-blur-[24px] saturate-[180%] transition-colors duration-500 pointer-events-none"
              style={{
                clipPath: `path('${notchPath}')`,
                WebkitClipPath: `path('${notchPath}')`,
              }}
            />

            {/* 2. SVG Vector Layer: 1px Crisp Glass Border & Top Shimmer Rim */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              width={navWidth}
              height={64}
              viewBox={`0 0 ${navWidth} 64`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Light Mode Border */}
                <linearGradient id="nav-border-light" x1="0" y1="0" x2={navWidth} y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
                </linearGradient>

                {/* Dark Mode Border */}
                <linearGradient id="nav-border-dark" x1="0" y1="0" x2={navWidth} y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
                  <stop offset="50%" stopColor="#C084FC" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.12" />
                </linearGradient>

                {/* Top Rim Shimmer Highlight */}
                <linearGradient id="nav-shimmer" x1="0" y1="0" x2={navWidth} y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                  <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
                </linearGradient>

                {/* Notch Inner Shadow / Depth Glow */}
                <radialGradient id="notch-depth-glow" cx={cx} cy={20} r={40} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.1" />
                  <stop offset="80%" stopColor="#6D28D9" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Perimeter Glass Border */}
              <path
                d={notchPath}
                className="stroke-[url(#nav-border-light)] dark:stroke-[url(#nav-border-dark)]"
                strokeWidth="1.2"
                fill="none"
              />

              {/* Top Shimmer Light Contour */}
              <path
                d={topRimPath}
                stroke="url(#nav-shimmer)"
                strokeWidth="0.8"
                strokeOpacity="0.75"
                fill="none"
              />

              {/* Notch Cradle Depth Glow */}
              <circle
                cx={cx}
                cy={18}
                r={36}
                fill="url(#notch-depth-glow)"
              />
            </svg>

            {/* 3. Navigation Grid (5-column layout) */}
            <div className="grid grid-cols-5 h-full relative items-center px-2 z-10">
              
              {/* Animated Active Capsule Pill (Ultra-Translucent Frosted Glass) */}
              <div 
                className={`absolute h-[50px] bg-gradient-to-b from-white/65 via-white/40 to-white/20 dark:from-white/20 dark:via-white/10 dark:to-white/5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 shadow-[0_4px_16px_rgba(46,16,101,0.08),inset_0_1.5px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(255,255,255,0.25)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1.5px_1px_rgba(255,255,255,0.25)] border border-white/70 dark:border-white/20 backdrop-blur-xl saturate-[180%] ${
                  isNavActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                }`}
                style={{ 
                  width: 'calc(20% - 6px)', 
                  left: `calc(${Math.max(0, activeIndex) * 20}% + 3px)`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />

              {navItems.map((item) => {
                if (item.id === 'empty') {
                  return <div key="empty" className="w-full h-full pointer-events-none" />;
                }
                
                const Icon = item.icon!;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as PageId)}
                    className={`w-full h-full flex flex-col items-center justify-center relative z-10 transition-all duration-300 active:scale-90 ${
                      isActive ? 'text-[#2E1065] dark:text-purple-200' : 'text-[#2E1065]/45 dark:text-white/45 hover:text-[#2E1065] dark:hover:text-white'
                    }`}
                  >
                    <Icon 
                      className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_2px_8px_rgba(46,16,101,0.25)]' : 'scale-100'}`} 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                  </button>
                );
              })}
            </div>

            {/* 4. Floating Action Button (FAB) nested in the Notch Cradle */}
            <button
              onClick={() => setAddMenuOpen(!isAddMenuOpen)}
              className={`absolute left-1/2 -translate-x-1/2 -top-6.5 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_10px_28px_rgba(46,16,101,0.45)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.6)] z-50 transition-all duration-300 ease-out border-2 border-white/50 dark:border-white/30 backdrop-blur-md active:scale-90 ${
                isAddMenuOpen ? 'rotate-[135deg] bg-gradient-to-tr from-pink-400 to-rose-400' : 'bg-gradient-to-tr from-[#2E1065] via-[#3B1278] to-[#581C87] hover:scale-105'
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
