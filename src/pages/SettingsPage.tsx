import PageHeader from '@/components/layout/PageHeader';
import SettingsView from '@/components/settings/SettingsView';

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="ตั้งค่า" />
      <SettingsView />
      <div className="h-4" />
    </>
  );
}
