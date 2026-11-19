import { requireAdminPage } from '@/lib/auth';
import { getSettings } from '@/actions/settings';
import SmtpForm from '@/components/admin/settings/SmtpForm';

export const metadata = {
  title: 'Email server (SMTP) Settings | HLG Hausgeräte Admin',
};

export default async function SmtpSettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <SmtpForm initialSettings={settings} />
    </div>
  );
}
