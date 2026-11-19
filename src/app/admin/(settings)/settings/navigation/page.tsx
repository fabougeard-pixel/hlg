import { requireAdminPage } from '@/lib/auth';
import { getSettings } from '@/actions/settings';
import NavigationForm from '@/components/admin/settings/NavigationForm';

export const metadata = {
  title: 'Navigation menu Settings | HLG Hausgeräte Admin',
};

export default async function NavigationSettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <NavigationForm initialSettings={settings} />
    </div>
  );
}
