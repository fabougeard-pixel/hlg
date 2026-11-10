import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function AccountReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const t = await getTranslations('AccountReviews');
  const locale = await getLocale();

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex gap-8">
        
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">{t('my_space')}</h2>
            <nav className="space-y-3">
              <Link href="/account" className="block text-gray-600 hover:text-orange-600">{t('dashboard')}</Link>
              <Link href="/account/orders" className="block text-gray-600 hover:text-orange-600">{t('my_orders')}</Link>
              <Link href="/account/reviews" className="block font-bold text-orange-600">{t('my_reviews')}</Link>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('my_reviews')}</h1>

          {reviews.length === 0 ? (
            <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-500">{t('no_reviews')}</p>
              <Link href="/" className="inline-block mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700">{t('continue_shopping')}</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        <Link href={`/produkt/${review.product.slug}`} className="hover:text-orange-600">
                          {review.product.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-orange-600">
                          {[1,2,3,4,5].map(i => (
                            <span key={i} className={i <= review.rating ? '' : 'text-gray-300'}>★</span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          - {new Date(review.createdAt).toLocaleDateString(locale)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.isApproved ? t('approved') : t('pending_moderation')}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
