import { requireAdminPage } from '@/lib/auth';
import { getSettings } from '@/actions/settings';
import RegionalForm from '@/components/admin/settings/RegionalForm';

export const metadata = {
  title: 'Regional and Currency Settings | HLG Hausgeräte Admin',
};

export default async function RegionalSettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <RegionalForm initialSettings={settings} />
    </div>
  );
}
