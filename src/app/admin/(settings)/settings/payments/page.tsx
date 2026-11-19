import { requireAdminPage } from '@/lib/auth';
import { getSettings } from '@/actions/settings';
import PaymentsForm from '@/components/admin/settings/PaymentsForm';

export const metadata = {
  title: 'Payments Settings | HLG Hausgeräte Admin',
};

export default async function PaymentsSettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <PaymentsForm initialSettings={settings} />
    </div>
  );
}
