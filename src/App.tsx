import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { getUserFavorites, fetchCategories } from '@/services/transactionService';
import HomePage from '@/pages/HomePage';
import OverviewPage from '@/pages/OverviewPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AddPage from '@/pages/AddPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import BottomNav from '@/components/layout/BottomNav';
import ReviewSlipModal from '@/components/ui/ReviewSlipModal';
import { Loader2 } from 'lucide-react';

function App() {
  const currentPage = useAppStore((s) => s.currentPage);
  const theme = useThemeStore((state) => state.theme);
  const font = useThemeStore((state) => state.font);
  const { user, loading, setUser, setLoading } = useAuthStore();

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply Font
  useEffect(() => {
    document.documentElement.style.setProperty('--font-sans', `"${font}", ui-sans-serif, system-ui, sans-serif`);
    document.body.style.fontFamily = `var(--font-sans)`;
  }, [font]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  useEffect(() => {
    if (user) {
      useTransactionStore.getState().initSync(user.uid);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-app">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] bg-[#FDE8FE] relative overflow-hidden flex flex-col mx-auto md:max-w-md md:shadow-2xl md:border-x border-slate-200">
      
      {/* Aurora Mesh Gradient Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top-right Purple/Blue Orb */}
        <div className="absolute -top-[10%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-purple-400 to-cyan-300 opacity-60 blur-3xl mix-blend-multiply" />
        
        {/* Bottom-left Pink Orb */}
        <div className="absolute top-[40%] -left-[20%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-pink-300 to-rose-300 opacity-60 blur-3xl mix-blend-multiply" />
        
        {/* Bottom-right Deep Purple Orb */}
        <div className="absolute -bottom-[10%] -right-[20%] w-[90vw] h-[90vw] rounded-full bg-gradient-to-bl from-purple-500 to-indigo-400 opacity-40 blur-[80px] mix-blend-multiply" />
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
        </>
      )}
    </div>
  );
}

export default App;
