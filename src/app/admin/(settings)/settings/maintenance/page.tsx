import { requireAdminPage } from '@/lib/auth';
import { getSettings } from '@/actions/settings';
import MaintenanceForm from '@/components/admin/settings/MaintenanceForm';

export const metadata = {
  title: 'Maintenance mode Settings | HLG Hausgeräte Admin',
};

export default async function MaintenanceSettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <MaintenanceForm initialSettings={settings} />
    </div>
  );
}
