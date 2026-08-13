import AppHeader from '@/components/layout/AppHeader';
import SettingsView from '@/components/settings/SettingsView';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-transparent animate-fade-in">
      <AppHeader pageTitle="ตั้งค่า" />
      <div className="flex-1  no-scrollbar pb-32">
        <SettingsView />
      </div>
    </div>
  );
}
