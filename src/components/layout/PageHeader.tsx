import { ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
}

export default function PageHeader({ title, showBack }: PageHeaderProps) {
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  return (
    <header className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 z-20 bg-gradient-to-b from-[#FDE8FE] via-[#FDE8FE]/80 to-transparent dark:from-[#0F0720] dark:via-[#0F0720]/80 dark:to-transparent rounded-b-3xl backdrop-blur-[2px]">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => setCurrentPage('home')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <ChevronLeft size={20} style={{ color: 'var(--text-primary)' }} />
          </button>
        )}
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h1>
      </div>
    </header>
  );
}
