import prisma from '@/lib/prisma';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import ProductPageClient from '@/components/product/ProductPageClient';
import Price from '@/components/Price';
import ProductReviews from '@/components/product/ProductReviews';
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import { safeJsonLd } from '@/lib/security';

import { Metadata } from 'next';

import { getCachedProductBySlug, getCachedSettings, getCachedRelatedProducts } from '@/lib/cache';
import { getCategoryCanonicalPath } from '@/lib/categories';
import { SITE_URL } from '@/lib/site';
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const product = await getCachedProductBySlug(slug);
  
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "HLG Hausgeräte";

  if (!product) {
    return {
      title: `Produto não encontrado - ${storeName}`,
    };
  }

  return {
    title: product.metaTitle ? product.metaTitle : `${product.title} | ${storeName}`,
    description: product.metaDescription || (product.shortDescription ? product.shortDescription.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').substring(0, 160) : '') || (product.description ? product.description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').substring(0, 160) : ''),
    alternates: {
      canonical: `/produto/${product.slug}`,
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const product = await getCachedProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  // SEO Fallback: If URL slug differs from canonical product slug (e.g. without numeric suffix), 301/308 redirect
  if (slug !== product.slug) {
    permanentRedirect(`/produto/${product.slug}`);
  }

  const t = await getTranslations('Product');

  const settingsMap = await getCachedSettings();
  const enableBuyNow = settingsMap.ENABLE_BUY_NOW_BUTTON === 'true';
  const shippingInfo = [
    settingsMap.SHIPPING_INFO_1 || '3-5 dias úteis em Portugal Continental',
    settingsMap.SHIPPING_INFO_2 || '5-7 dias úteis para envios internacionais',
    settingsMap.SHIPPING_INFO_3 || 'Descarga por plataforma elevatória incluída',
    settingsMap.SHIPPING_INFO_4 || 'Devolução legal até 14 dias',
  ];

  // Related products (same category)
  const categoryIds = (product as any).categories?.map((c: any) => c.id) || [];
  const relatedProducts = await getCachedRelatedProducts(categoryIds, product.id);

  // Lowest shipping rate for PT (default)
  const ptZone = await prisma.shippingZone.findFirst({
    where: { name: { in: ['PT', 'Portugal', 'DE'] }, isActive: true },
    include: { methods: { where: { isActive: true }, orderBy: { rate: 'asc' } } }
  });
  const lowestShippingRate = ptZone?.methods?.[0]?.rate ?? 0;

  // Canonical category path for SEO
  const primaryCat = (product as any).categories?.[0];
  const primaryCatPath = primaryCat ? await getCategoryCanonicalPath(primaryCat.id) : null;

  // Check if logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'HLG Hausgeräte';

  const reviews = (product as any).reviews || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviews.length
    : 0;

  const schemaJson: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images || [],
    description: (product.description ? product.description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : undefined) || (product.shortDescription ? product.shortDescription.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : undefined),
    sku: product.id.split('-')[0].toUpperCase(),
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://lenhaecarvaosilvadias.com'}/produto/${product.slug}`,
      priceCurrency: 'EUR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock && product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: storeName
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PT',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: lowestShippingRate,
          currency: 'EUR'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PT'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'd'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 5,
            unitCode: 'd'
          }
        }
      }
    }
  };

  if (reviews.length > 0) {
    schemaJson.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews.length,
    };
    schemaJson.review = reviews.map((r: any) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
      },
      author: {
        '@type': 'Person',
        name: r.reviewerName || 'Cliente',
      },
      reviewBody: r.comment || '',
      datePublished: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : undefined,
    }));
  }

  if ((product as any).brand) {
    schemaJson.brand = {
      '@type': 'Brand',
      name: (product as any).brand.name
    };
  }

  if ((product as any).gtin) {
    schemaJson.gtin = (product as any).gtin;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      
      <main className="flex-grow pb-28 lg:pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(schemaJson)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Início',
                  item: SITE_URL,
                },
                ...(primaryCat ? [{
                  '@type': 'ListItem',
                  position: 2,
                  name: primaryCat.name,
                  item: `${SITE_URL}${primaryCatPath || `/product-category/${primaryCat.slug || primaryCat.id}`}`,
                }] : []),
                {
                  '@type': 'ListItem',
                  position: primaryCat ? 3 : 2,
                  name: product.title,
                  item: `${SITE_URL}/produto/${product.slug}`,
                },
              ],
            })
          }}
        />
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200 mb-4 sm:mb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Link href="/" className="hover:text-red-600 transition">{t('home')}</Link>
            <span className="text-gray-300">/</span>
            {primaryCat ? (
              <Link 
                href={primaryCatPath || `/product-category/${primaryCat.slug || primaryCat.id}`}
                className="hover:text-red-600 transition"
              >
                {primaryCat.name}
              </Link>
            ) : (
              <span>{t('category')}</span>
            )}
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">{product.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-10">
          <div id="cart-notification-portal"></div>
          <div className="flex flex-col lg:flex-row gap-12">
            <ProductPageClient
              product={product as any}
              enableBuyNow={enableBuyNow}
              storeName={storeName}
              shippingInfo={shippingInfo}
              contactSlug={settingsMap.CONTACT_SLUG || 'contact'}
              translations={{
                sku: t('sku'),
                categories: t('categories'),
                tags: t('tags'),
                sold: t('sold'),
                customer_reviews: t('customer_reviews', { count: (product as any).reviews?.length || 0 }),
                uncategorized: t('uncategorized'),
                brand: t('brand')
              }}
            />
          </div>

          {/* Tabs Section (Description & Reviews) */}
          <ProductReviews 
            productId={product.id}
            productTitle={product.title}
            reviews={(product as any).reviews || []}
            description={product.description}
            isLoggedIn={isLoggedIn}
          />

          {/* Related Products Section */}
          <div className="mt-20">
            <div className="border-b border-gray-200 pb-4 mb-8">
              <h2 className="text-xl font-bold text-gray-900">{t('related_products')}</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.length > 0 ? (
                relatedProducts.map(rp => (
                  <Link href={`/produto/${rp.slug}`} key={rp.id} className="group border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition flex flex-col">
                    <div className="relative h-48 w-full flex items-center justify-center mb-4">
                      {rp.images && rp.images[0] ? (
                        <Image width={800} height={800} src={rp.images[0]} alt={rp.title} title={rp.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="text-6xl text-gray-300">🛍️</div>
                      )}
                    </div>
                    <div className="mt-auto">
                      <p className="text-xs text-blue-500 font-semibold mb-1">{rp.categories && rp.categories.length > 0 ? rp.categories[0].name : t('general')}</p>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition">{rp.title}</h3>
                      <Price amount={rp.price} className="font-bold text-red-600" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm">{t('no_related_products')}</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
