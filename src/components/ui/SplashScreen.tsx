import { useAppStore } from '@/store/useAppStore';
import { getIconComponent } from '@/utils/categoryStyles';
import { useEffect, useState, useRef } from 'react';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const appName = useAppStore(s => s.appName);
  const appIconName = useAppStore(s => s.appIcon);
  const AppIcon = getIconComponent(appIconName);

  const [displayedText, setDisplayedText] = useState('');

  // Typing effect
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    let i = 0;
    // Slight delay before typing starts
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(appName.slice(0, i + 1));
        i++;
        if (i >= appName.length) {
          clearInterval(interval);
          if (onFinishRef.current) {
            setTimeout(onFinishRef.current, 500); // 500ms pause after typing finishes
          }
        }
      }, 100); // 100ms per character
      return () => clearInterval(interval);
    }, 400);

    return () => clearTimeout(timeout);
  }, [appName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#FDE8FE] dark:bg-[#0F0720] transition-colors duration-500 overflow-hidden relative">
      
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[10%] left-[-10%] w-[60%] h-[60%] bg-[#A855F7]/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-[#3B82F6]/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      <div className="flex flex-col items-center z-10">
        {/* Animated Logo Container */}
        <div className="w-28 h-28 flex items-center justify-center animate-fade-in mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#A855F7]/30 to-transparent blur-[30px] rounded-full animate-pulse-slow" />
          {appIconName.startsWith('http') ? (
            <img src={appIconName} alt="App Icon" className="w-24 h-24 object-cover rounded-[28px] relative z-10 animate-slide-down drop-shadow-2xl" />
          ) : (
            <AppIcon className="w-20 h-20 text-[#2E1065] dark:text-white drop-shadow-2xl relative z-10 animate-slide-down" />
          )}
        </div>

        {/* Typing App Name */}
        <div className="relative inline-block h-[48px] flex items-center justify-center">
          <h1 className="text-[36px] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-[#2E1065] to-[#6D28D9] dark:from-white dark:to-white/70 drop-shadow-sm whitespace-nowrap">
            {displayedText}
            <span className="inline-block w-[3.5px] h-[30px] ml-1 bg-[#8B5CF6] dark:bg-[#A78BFA] animate-blink align-middle translate-y-[-3px] rounded-full" />
          </h1>
        </div>
      </div>
    </div>
  );
}
