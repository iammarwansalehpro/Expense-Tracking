import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { getUserFavorites, fetchCategories, getAppInfo } from '@/services/transactionService';
import { getUserWallets, saveUserWallets } from '@/services/walletService';
import { useWalletStore } from '@/store/useWalletStore';
import HomePage from '@/pages/HomePage';
import OverviewPage from '@/pages/OverviewPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AddPage from '@/pages/AddPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import BottomNav from '@/components/layout/BottomNav';
import ReviewSlipModal from '@/components/ui/ReviewSlipModal';
import ToastProvider from '@/components/ui/ToastProvider';
import GlobalConfirmModal from '@/components/ui/GlobalConfirmModal';
import TransferModal from '@/components/ui/TransferModal';
import VoiceCommandModal from '@/components/ui/VoiceCommandModal';
import { Loader2 } from 'lucide-react';
import SplashScreen from '@/components/ui/SplashScreen';

function App() {
  const currentPage = useAppStore((s) => s.currentPage);
  const theme = useThemeStore((state) => state.theme);
  const font = useThemeStore((state) => state.font);
  const { user, loading, setUser, setLoading } = useAuthStore();
  
  // Ensure splash screen is shown long enough for typing animation
  const [minSplashTimeDone, setMinSplashTimeDone] = useState(false);

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark' && user) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, user]);

  // Apply Font
  useEffect(() => {
    document.documentElement.style.setProperty('--font-sans', `"${font}", ui-sans-serif, system-ui, sans-serif`);
    document.body.style.fontFamily = `var(--font-sans)`;
  }, [font]);

  useEffect(() => {
    // Fetch global app settings once on mount (before login)
    getAppInfo().then(info => {
      useAppStore.getState().setAppInfo(info.name, info.subtitle, info.icon || 'Type');
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Save profile for admin dashboard
      if (currentUser) {
        set(ref(db, `users/${currentUser.uid}/profile`), {
          displayName: currentUser.displayName || 'Unknown',
          email: currentUser.email || '-',
          photoURL: currentUser.photoURL || '',
          lastLogin: new Date().toISOString()
        }).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  useEffect(() => {
    if (user) {
      useTransactionStore.getState().initSync(user.uid);
      
      getUserWallets(user.uid).then(wallets => {
        if (wallets && wallets.length > 0) {
          useWalletStore.getState().setWallets(wallets);
        } else {
          const localWallets = useWalletStore.getState().wallets;
          if (localWallets.length > 0) {
            saveUserWallets(user.uid, localWallets);
          }
        }
      });

      getUserFavorites(user.uid).then(favs => {
        useAppStore.getState().setFavoriteCategories(favs);
      });
      fetchCategories().then(cats => {
        useAppStore.getState().setAppCategories(cats);
      });
    } else {
      useTransactionStore.getState().stopSync();
    }
  }, [user]);

  const isAppReady = !loading && minSplashTimeDone;

  if (!isAppReady) {
    return <SplashScreen onFinish={() => setMinSplashTimeDone(true)} />;
  }

  return (
    <div className="w-full h-full min-h-[100dvh] bg-[#FDE8FE] dark:bg-[#0F0720] relative overflow-hidden flex flex-col mx-auto md:max-w-md md:shadow-2xl md:border-x border-slate-200 dark:border-white/10 transition-colors duration-500">
      
      {/* Aurora Mesh Gradient Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top-right Purple/Blue Orb */}
        <div className="absolute -top-[10%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-purple-400 to-cyan-300 opacity-60 dark:opacity-40 blur-[80px] mix-blend-multiply dark:mix-blend-screen transition-opacity duration-500" />
        
        {/* Bottom-left Pink Orb */}
        <div className="absolute top-[40%] -left-[20%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-pink-300 to-rose-300 opacity-60 dark:opacity-30 blur-[80px] mix-blend-multiply dark:mix-blend-screen transition-opacity duration-500" />
        
        {/* Bottom-right Deep Purple Orb */}
        <div className="absolute -bottom-[10%] -right-[20%] w-[90vw] h-[90vw] rounded-full bg-gradient-to-bl from-purple-500 to-indigo-400 opacity-40 dark:opacity-40 blur-[100px] mix-blend-multiply dark:mix-blend-screen transition-opacity duration-500" />
      </div>
      {/* If not logged in, show Login Page */}
      {!user ? (
        <LoginPage />
      ) : (
        <>
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative z-0">
            {currentPage === 'home' && <HomePage />}
            {currentPage === 'overview' && <OverviewPage />}
            {currentPage === 'statistics' && <AnalyticsPage />}
            {currentPage === 'add' && <AddPage />}
            {currentPage === 'settings' && <SettingsPage />}
          </main>

          {/* Fixed Bottom Navigation */}
          <BottomNav />
          <ReviewSlipModal />
          <TransferModal />
          <VoiceCommandModal />
          <ToastProvider />
          <GlobalConfirmModal />
        </>
      )}
    </div>
  );
}

export default App;
