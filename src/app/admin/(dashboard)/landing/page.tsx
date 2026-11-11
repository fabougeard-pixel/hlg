import { getTranslations } from 'next-intl/server';
import { getSettings } from '@/actions/settings';
import { getCategories, getBrands } from '@/actions/admin';
import LandingForm from './LandingForm';

export default async function AdminLandingPage() {
  const t = await getTranslations('AdminLanding');
  const [initialSettings, categories, brands] = await Promise.all([
    getSettings(),
    getCategories(),
    getBrands(),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500">{t('subtitle')}</p>
      </div>
      
      
      <LandingForm initialSettings={initialSettings} categories={categories} brands={brands} />
    </>
  );
}
