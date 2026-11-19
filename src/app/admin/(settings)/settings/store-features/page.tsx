import { requireAdminPage } from '@/lib/auth';
import { getSettings } from '@/actions/settings';
import StoreFeaturesForm from '@/components/admin/settings/StoreFeaturesForm';

export const metadata = {
  title: 'Store features Settings | HLG Hausgeräte Admin',
};

export default async function StoreFeaturesSettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <StoreFeaturesForm initialSettings={settings} />
    </div>
  );
}
