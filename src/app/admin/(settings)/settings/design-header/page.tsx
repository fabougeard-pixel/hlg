import { requireAdminPage } from '@/lib/auth';
import { getSettings } from '@/actions/settings';
import DesignHeaderForm from '@/components/admin/settings/DesignHeaderForm';

export const metadata = {
  title: 'Header and product cards Settings | HLG Hausgeräte Admin',
};

export default async function DesignHeaderSettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <DesignHeaderForm initialSettings={settings} />
    </div>
  );
}
