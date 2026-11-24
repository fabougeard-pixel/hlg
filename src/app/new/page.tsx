/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCachedNewProducts } from '@/lib/cache';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import ProductCard from '@/components/shop/ProductCard';

export const dynamic = 'force-dynamic';

export default async function NewArrivalsPage() {
  const t = await getTranslations('NewArrivals');

  const products = await getCachedNewProducts(12);

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-gray-200">
            <h2 className="text-xl font-medium text-gray-900 mb-2">{t('no_products')}</h2>
            <Link href="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2 rounded transition">
              {t('back_to_home')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  discountLabel: t('new_badge')
                } as any} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
