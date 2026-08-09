import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAppStore } from '@/store/useAppStore';
import { getIconComponent } from '@/utils/categoryStyles';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const appName = useAppStore(s => s.appName);
  const appSlogan = useAppStore(s => s.appSlogan);
  const appIconName = useAppStore(s => s.appIcon);
  const AppIcon = getIconComponent(appIconName);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 bg-transparent animate-fade-in relative overflow-hidden">

      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#A855F7]/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3B82F6]/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col items-center mb-16 relative z-10 text-center">
        {/* App Icon */}
        {appIconName.startsWith('http') ? (
          <img 
            src={appIconName} 
            alt="App Icon" 
            className="w-[180px] h-[180px] object-contain drop-shadow-2xl mb-3 transition-transform duration-500 hover:scale-105" 
          />
        ) : (
          <div className="w-[160px] h-[160px] bg-gradient-to-br from-white/90 to-white/40 backdrop-blur-xl rounded-[48px] flex items-center justify-center border border-white/60 shadow-[0_12px_40px_rgba(46,16,101,0.12)] mb-3 relative group hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#A855F7]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[48px]" />
            <AppIcon className="w-[80px] h-[80px] text-[#2E1065] drop-shadow-lg relative z-10" />
          </div>
        )}

        {/* App Title */}
        <h1 className="text-[42px] font-black tracking-tighter leading-none mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#2E1065] to-[#6D28D9] drop-shadow-sm">
          {appName}
        </h1>

        {/* App Slogan */}
        <p className="text-[#2E1065]/60 font-bold text-[12px] uppercase tracking-[0.2em] max-w-[280px] leading-relaxed">
          {appSlogan}
        </p>
      </div>

      <div className="w-full max-w-[320px] relative z-10 flex flex-col gap-5">
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white/70 backdrop-blur-xl text-[#2E1065] font-bold py-4 px-6 rounded-[24px] shadow-[0_8px_24px_rgba(31,38,135,0.05)] border border-white/80 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-white/90 hover:shadow-[0_12px_32px_rgba(31,38,135,0.1)] group"
        >
          <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="flex-1 text-center text-[15.5px] mr-[22px] tracking-wide">Continue with Google</span>
        </button>

        <div className="flex items-center justify-center text-[#2E1065]/40 text-[9px] sm:text-[11px] font-bold tracking-widest mt-2 whitespace-nowrap">
          Created by Marwan Saleh &copy; All rights reserved.
        </div>
      </div>
    </div>
  );
}
