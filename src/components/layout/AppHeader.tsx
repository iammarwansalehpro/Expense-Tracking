import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getIconComponent } from '@/utils/categoryStyles';

interface AppHeaderProps {
  pageTitle?: string;
  showBack?: boolean;
}

export default function AppHeader({ pageTitle }: AppHeaderProps) {
  const appName = useAppStore(s => s.appName);
  const appSlogan = useAppStore(s => s.appSlogan);
  const appIconName = useAppStore(s => s.appIcon);
  
  const language = useSettingsStore(s => s.language);
  const setLanguage = useSettingsStore(s => s.setLanguage);
  
  const AppIcon = getIconComponent(appIconName);

  return (
    <div className="w-full pb-6 px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] flex justify-between items-center shrink-0">
      {/* Logo & Title */}
      <div className="flex items-center gap-2.5">
        {appIconName.startsWith('http') ? (
          <img 
            src={appIconName} 
            alt="App Logo" 
            className="w-[64px] h-[64px] object-contain drop-shadow-md shrink-0 transition-transform duration-300 hover:scale-105 dark:bg-white/80 dark:p-1.5 dark:rounded-[18px]" 
          />
        ) : (
          <div className="w-[64px] h-[64px] bg-gradient-to-br from-white/90 to-white/40 backdrop-blur-xl rounded-[18px] flex items-center justify-center border border-white/60 shadow-[0_8px_16px_rgba(46,16,101,0.06)] shrink-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#A855F7]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <AppIcon className="w-8 h-8 text-[#2E1065] drop-shadow-sm relative z-10" />
          </div>
        )}
        <div className="flex flex-col justify-center">
          <span className="font-black text-[22px] leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#2E1065] to-[#6D28D9] dark:from-white dark:to-purple-200 drop-shadow-sm mb-0.5">{appName}</span>
          <span className="text-[10px] font-bold text-[#2E1065]/50 dark:text-white/60 uppercase tracking-[0.15em] leading-none">{appSlogan}</span>
        </div>
      </div>
      
      {/* TH-EN Toggle */}
      <button 
        onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
        className="relative px-3 py-2 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 active:scale-95 transition-transform shadow-sm gap-1 shrink-0"
      >
        <span className={`text-[10px] font-bold ${language === 'th' ? 'text-[#2E1065]' : 'text-[#2E1065]/40'}`}>TH</span>
        <div className="w-px h-3 bg-[#2E1065]/20 mx-0.5" />
        <span className={`text-[10px] font-bold ${language === 'en' ? 'text-[#2E1065]' : 'text-[#2E1065]/40'}`}>EN</span>
      </button>
    </div>
  );
}
