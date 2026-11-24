/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import prisma from '@/lib/prisma';
import ProductCard from '@/components/shop/ProductCard';
import ShopFilters from '@/components/shop/ShopFilters';
import ShopSort from '@/components/shop/ShopSort';
import ShopPagination from '@/components/shop/ShopPagination';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCachedSettings, getCachedShopFilterData, PRODUCT_CARD_SELECT } from '@/lib/cache';

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "HLG Hausgeräte";

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "HLG Hausgeräte";

  // Extract category
  const categoryParams = params.category;
  const rawCategories = Array.isArray(categoryParams) ? categoryParams : categoryParams ? [categoryParams] : [];
  const categories = rawCategories.map(c => decodeURIComponent(c));

  if (categories.length === 1) {
    const rawCat = categories[0];
    const orCond: any[] = [{ slug: rawCat }];
    if (isUuid(rawCat)) {
      orCond.push({ id: rawCat });
    }
    const category = await prisma.category.findFirst({
      where: { OR: orCond }
    });

    if (category) {
      return {
        title: category.metaTitle ? category.metaTitle : `${category.name} | ${storeName}`,
        description: category.metaDescription || `Kaufen Sie ${category.name} günstig online bei ${storeName}.`,
        alternates: {
          canonical: `/shop?category=${category.slug}`,
        },
      };
    }
  }

  return {
    title: `Shop | ${storeName}`,
    description: 'Entdecken Sie hochwertige Haushaltsgeräte bei HLG Hausgeräte: Waschmaschinen, Geschirrspüler, Kaffeemaschinen, Kühlschränke und Herde zu besten Preisen.',
    alternates: {
      canonical: '/shop',
    },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const t = await getTranslations('Shop');

  // Extract query params
  const categoryParams = params.category;
  const rawCategories = Array.isArray(categoryParams) ? categoryParams : categoryParams ? [categoryParams] : [];
  const categories = rawCategories.map(c => decodeURIComponent(c));

  const brandParams = params.brand;
  const rawBrands = Array.isArray(brandParams) ? brandParams : brandParams ? [brandParams] : [];
  const brandsFilter = rawBrands.map(b => decodeURIComponent(b));

  const minPrice = params.minPrice ? parseFloat(params.minPrice as string) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice as string) : undefined;

  const ratingParams = params.rating;
  const ratings = Array.isArray(ratingParams) ? ratingParams.map(Number) : ratingParams ? [Number(ratingParams)] : [];

  const sort = params.sort as string;
  const page = params.page ? parseInt(params.page as string) : 1;
  const limit = 12;

  // Build Prisma where clause
  const where: any = {
    isDeleted: false,
  };

  if (categories.length > 0) {
    const catUuids = categories.filter(isUuid);
    const catSlugs = categories.filter(s => !isUuid(s));
    const catConditions: any[] = [];
    if (catSlugs.length > 0) catConditions.push({ slug: { in: catSlugs } });
    if (catUuids.length > 0) catConditions.push({ id: { in: catUuids } });

    if (catConditions.length > 0) {
      where.categories = {
        some: {
          OR: catConditions
        }
      };
    }
  }

  if (brandsFilter.length > 0) {
    const brandUuids = brandsFilter.filter(isUuid);
    const brandSlugs = brandsFilter.filter(s => !isUuid(s));
    const brandConditions: any[] = [];
    if (brandSlugs.length > 0) {
      for (const brandVal of brandSlugs) {
        brandConditions.push({ slug: { equals: brandVal, mode: 'insensitive' } });
        brandConditions.push({ name: { equals: brandVal, mode: 'insensitive' } });
      }
    }
    if (brandUuids.length > 0) {
      brandConditions.push({ id: { in: brandUuids } });
    }

    if (brandConditions.length > 0) {
      where.brand = {
        OR: brandConditions
      };
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined && !isNaN(minPrice)) where.price.gte = minPrice;
    if (maxPrice !== undefined && !isNaN(maxPrice)) where.price.lte = maxPrice;
  }

  // Fetch cached filter sidebar data (categories, brands, price min/max)
  const { allCategories, allBrands, globalMinPrice, globalMaxPrice } = await getCachedShopFilterData();

  // Fetch cached shop specific settings
  const settingsMap = await getCachedSettings();
  const cardStyle = (settingsMap.SHOP_CARD_STYLE as 'design1' | 'design2') || 'design2';
  const borderColor = settingsMap.SHOP_CARD_BORDER_COLOR || '';

  // Sorting
  let orderBy: any = { createdAt: 'desc' }; // default 'newest'
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };

  let totalResults = 0;
  let paginatedProducts: any[] = [];

  // When rating filter is active (rare), filter in memory with lightweight projection
  if (ratings.length > 0) {
    const products = await prisma.product.findMany({
      where,
      select: PRODUCT_CARD_SELECT,
      orderBy
    });

    const filtered = products.filter(p => {
      const avg = p.reviews && p.reviews.length > 0
        ? p.reviews.reduce((acc, curr) => acc + curr.rating, 0) / p.reviews.length
        : 0;
      const roundedAvg = Math.round(avg);
      return ratings.includes(roundedAvg) || (ratings.includes(0) && (!p.reviews || p.reviews.length === 0));
    });

    totalResults = filtered.length;
    const startIndex = (page - 1) * limit;
    paginatedProducts = filtered.slice(startIndex, startIndex + limit);
  } else {
    // Standard pagination directly at SQL level: transfers only 12 lightweight rows!
    const [count, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: PRODUCT_CARD_SELECT,
        orderBy,
        take: limit,
        skip: (page - 1) * limit
      })
    ]);
    totalResults = count;
    paginatedProducts = rows;
  }

  const totalPages = Math.ceil(totalResults / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalResults);
  const currentRange = `${totalResults > 0 ? startIndex + 1 : 0}-${endIndex}`;

  const validCategories = allCategories
    .filter(c => c.slug !== null)
    .map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug as string,
      _count: c._count
    }));

  const validBrands = allBrands
    .map(b => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      _count: b._count
    }));

  const view = (params.view as 'grid' | 'list') || 'grid';

  let pageTitle = t('title');
  if (categories.length === 1) {
    const rawCat = categories[0];
    const selectedCategory = allCategories.find(c => c.slug === rawCat || (isUuid(rawCat) && c.id === rawCat));
    if (selectedCategory) {
      pageTitle = selectedCategory.name;
    }
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 px-4 sm:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto text-sm text-gray-500">
          <Link href="/" className="hover:text-orange-600">{t('home')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{pageTitle}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{pageTitle}</h1>
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar (Filters) */}
          <aside className="w-full lg:w-1/4 flex-shrink-0">
            <ShopFilters categories={validCategories} brands={validBrands} globalMinPrice={globalMinPrice} globalMaxPrice={globalMaxPrice} />
          </aside>

          {/* Main Content (Products) */}
          <section className="w-full lg:w-3/4">

            <ShopSort totalResults={totalResults} currentRange={currentRange} />

            {paginatedProducts.length > 0 ? (
              <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-6"}>
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} view={view} cardStyle={cardStyle} borderColor={borderColor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('no_products_found')}</h3>
                <p className="text-gray-500">{t('try_modifying_filters')}</p>
              </div>
            )}

            <ShopPagination totalPages={totalPages} currentPage={page} />

          </section>
        </div>
      </div>
    </div>
  );
}
