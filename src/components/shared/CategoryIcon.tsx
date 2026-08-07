import { useAppStore } from '@/store/useAppStore';
import { getCategoryStyle } from '@/utils/categoryStyles';

interface CategoryIconProps {
  categoryName: string;
  size?: number;
}

export default function CategoryIcon({ categoryName, size = 20 }: CategoryIconProps) {
  const appCategories = useAppStore(s => s.appCategories);
  const { icon: Icon, color, textColor } = getCategoryStyle(categoryName, appCategories || undefined);

  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${color} ${textColor}`}
    >
      <Icon size={size} />
    </div>
  );
}
