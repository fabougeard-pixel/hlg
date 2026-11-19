import { requireAdminPage } from '@/lib/auth';
import TrashPageClient from './TrashPageClient';
import { getTranslations } from 'next-intl/server';
import { getTrashedProducts, getTrashedMedia } from '@/actions/trash';

export async function generateMetadata() {
  const t = await getTranslations('AdminTrash');
  return {
    title: `${t('title')} | HLG Hausgeräte Admin`,
  };
}

export default async function TrashPage() {
  await requireAdminPage();
  const trashedProducts = await getTrashedProducts();
  const trashedMedia = await getTrashedMedia();

  return (
    <TrashPageClient 
      initialProducts={trashedProducts} 
      initialMedia={trashedMedia} 
    />
  );
}
