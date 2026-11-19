import { requireAdminPage } from '@/lib/auth';
import { getSettings } from '@/actions/settings';
import TaxesForm from '@/components/admin/settings/TaxesForm';

export const metadata = {
  title: 'Taxes and VAT Settings | HLG Hausgeräte Admin',
};

export default async function TaxesSettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <TaxesForm initialSettings={settings} />
    </div>
  );
}
