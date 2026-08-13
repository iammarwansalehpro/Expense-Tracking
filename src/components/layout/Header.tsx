import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onLeftClick?: () => void;
  onRightClick?: () => void;
}

export default function Header({
  title,
  leftIcon,
  rightIcon,
  onLeftClick,
  onRightClick,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 pb-3 pt-5 bg-gradient-to-b from-[#FDE8FE] via-[#FDE8FE]/80 to-transparent dark:from-[#0F0720] dark:via-[#0F0720]/80 dark:to-transparent rounded-b-3xl backdrop-blur-[2px]">
      <div 
        className="w-10 h-10 flex items-center justify-start cursor-pointer text-slate-800"
        onClick={onLeftClick}
      >
        {leftIcon}
      </div>
      
      <h1 className="text-lg font-bold text-slate-800">{title}</h1>
      
      <div 
        className="w-10 h-10 flex items-center justify-end cursor-pointer relative"
        onClick={onRightClick}
      >
        {rightIcon}
        {rightIcon && (
          <span className="absolute top-2 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </div>
    </header>
  );
}
