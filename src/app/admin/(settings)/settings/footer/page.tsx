import { requireAdminPage } from '@/lib/auth';
import { getSettings } from '@/actions/settings';
import FooterForm from '@/components/admin/settings/FooterForm';

export const metadata = {
  title: 'Footer Settings | HLG Hausgeräte Admin',
};

export default async function FooterSettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <FooterForm initialSettings={settings} />
    </div>
  );
}
