import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { isSensitiveSettingKey } from '@/lib/security';

// Helper to get raw public settings (excluding all credentials, PII, and internal drafts)
async function fetchSettings() {
  const settingsDb = await prisma.setting.findMany();
  return settingsDb
    .filter(s => !isSensitiveSettingKey(s.key))
    .reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
}

// Cached version of settings
export const getCachedSettings = unstable_cache(
  async () => fetchSettings(),
  ['global-settings'],
  { tags: ['settings'], revalidate: 3600 }
);

// We need a helper for dynamic tags per slug since unstable_cache tags must be statically defined in the wrapper
// A common pattern is a factory function:
export const getCachedProductBySlug = async (slug: string) => {
  try {
    return await unstable_cache(
      async () => {
        const encodedSlugLower = encodeURIComponent(slug).toLowerCase();
        const encodedSlugUpper = encodeURIComponent(slug);
        let decodedSlug = slug;
        try { decodedSlug = decodeURIComponent(slug); } catch { /* ignore invalid URI encodings */ }

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);

        let product = await prisma.product.findFirst({
          where: { 
            isDeleted: false,
            OR: [
              { slug: slug },
              { slug: encodedSlugLower },
              { slug: encodedSlugUpper },
              { slug: decodedSlug },
              ...(isUuid ? [{ id: slug }] : [])
            ]
          },
          include: {
            categories: true,
            Product_ForceSales_A: true,
            Product_SaleTogether_A: true,
            brand: true,
            tags: true,
            reviews: {
              where: { isApproved: true },
              orderBy: { createdAt: 'desc' },
              include: { user: { select: { email: true } } }
            }
          }
        });

        // SEO Migration Fallback 1: If not found, check if a product exists with slug matching `${decodedSlug}-*` (suffix appended during WP/WooCommerce import)
        if (!product) {
          product = await prisma.product.findFirst({
            where: {
              isDeleted: false,
              slug: {
                startsWith: `${decodedSlug}-`
              }
            },
            include: {
              categories: true,
              Product_ForceSales_A: true,
              Product_SaleTogether_A: true,
              brand: true,
              tags: true,
              reviews: {
                where: { isApproved: true },
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true } } }
              }
            }
          });
        }

        // SEO Migration Fallback 2: If not found and input slug ends with numeric suffix (e.g. `-481`), check without suffix
        if (!product && /-\d+$/.test(decodedSlug)) {
          const strippedSlug = decodedSlug.replace(/-\d+$/, '');
          product = await prisma.product.findFirst({
            where: {
              isDeleted: false,
              slug: strippedSlug
            },
            include: {
              categories: true,
              Product_ForceSales_A: true,
              Product_SaleTogether_A: true,
              brand: true,
              tags: true,
              reviews: {
                where: { isApproved: true },
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true } } }
              }
            }
          });
        }

        // Do not cache negative misses (null) in unstable_cache so restored/new products appear immediately
        if (!product) {
          throw new Error('PRODUCT_NOT_FOUND');
        }

        // RGPD: Never leak raw emails to client RSC payload
        const sanitizedReviews = product.reviews.map(r => ({
          id: r.id,
          productId: r.productId,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          reviewerName: r.reviewerName || (r.user?.email ? r.user.email.split('@')[0] : 'Client'),
        }));

        return {
          ...product,
          reviews: sanitizedReviews,
        };
      },
      ['product-details-v3', slug],
      { tags: ['products', `product-${slug}`], revalidate: 3600 }
    )();
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') {
      return null;
    }
    throw err;
  }
};

export const getCachedRelatedProducts = async (categoryIds: string[], excludeProductId: string) => {
  // Sort IDs so the cache key is consistent
  const sortedIds = [...categoryIds].sort();
  return unstable_cache(
    async () => prisma.product.findMany({
      where: { 
        categories: { some: { id: { in: categoryIds } } }, 
        id: { not: excludeProductId } 
      },
      include: { categories: true },
      take: 4,
    }),
    ['related-products', sortedIds.join(','), excludeProductId],
    { tags: ['products'], revalidate: 3600 }
  )();
};

// Caching for Homepage best sellers
export const getCachedBestSellers = unstable_cache(
  async () => prisma.product.findMany({
    where: { isBestSeller: true, isDeleted: false },
    take: 8,
    include: { categories: true }
  }),
  ['home-best-sellers'],
  { tags: ['products'], revalidate: 3600 }
);

// Caching for Homepage latest products
export const getCachedLatestProducts = unstable_cache(
  async () => prisma.product.findMany({
    where: { isDeleted: false },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { categories: true }
  }),
  ['home-latest-products'],
  { tags: ['products'], revalidate: 3600 }
);

// Caching categories tree (only categories with >0 products, structured hierarchically)
export const getCachedCategoriesTree = unstable_cache(
  async () => {
    const allCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Only keep categories that have at least 1 product
    const withProducts = allCategories.filter(c => c._count.products > 0);

    // Organize hierarchically: roots first, followed by their children
    const roots = withProducts.filter(c => !c.parentId);
    const children = withProducts.filter(c => c.parentId);

    const childrenByParent = new Map<string, typeof withProducts>();
    for (const child of children) {
      if (child.parentId) {
        if (!childrenByParent.has(child.parentId)) {
          childrenByParent.set(child.parentId, []);
        }
        childrenByParent.get(child.parentId)!.push(child);
      }
    }

    const result: Array<{ id: string; name: string; slug: string | null; parentId: string | null }> = [];

    function addChildren(parentId: string) {
      const directChildren = childrenByParent.get(parentId) || [];
      for (const ch of directChildren) {
        result.push({
          id: ch.id,
          name: ch.name,
          slug: ch.slug,
          parentId: ch.parentId
        });
        addChildren(ch.id);
      }
    }

    for (const root of roots) {
      result.push({
        id: root.id,
        name: root.name,
        slug: root.slug,
        parentId: null
      });
      addChildren(root.id);
    }

    // Include any remaining child category whose root had 0 direct products
    for (const ch of children) {
      if (!result.find(r => r.id === ch.id)) {
        result.push({
          id: ch.id,
          name: ch.name,
          slug: ch.slug,
          parentId: ch.parentId
        });
      }
    }

    return result;
  },
  ['header-categories-with-products'],
  { tags: ['categories', 'products'], revalidate: 3600 }
);

export const getCachedProductCounts = unstable_cache(
  async () => {
    const [newCount, hotCount, saleCount] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { orderItems: { some: {} } } }),
      prisma.product.count({ where: { compareAtPrice: { not: null } } })
    ]);
    return { newCount, hotCount, saleCount };
  },
  ['layout-product-counts'],
  { tags: ['products'], revalidate: 3600 }
);

// Minimal product fields required for product cards (avoids fetching heavy HTML descriptions & attributes)
export const PRODUCT_CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  price: true,
  compareAtPrice: true,
  images: true,
  discountLabel: true,
  isBestSeller: true,
  type: true,
  categories: { select: { name: true, slug: true } },
  reviews: { select: { rating: true } }
} as const;

// Cached homepage products: full catalog lightweight selection
export const getCachedHomepageProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        images: true,
        discountLabel: true,
        isBestSeller: true,
        gtin: true,
        brand: { select: { name: true } },
        categories: { select: { name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },
  ['homepage-all-products'],
  { tags: ['products'], revalidate: 3600 }
);

// Cached shop filter sidebar data (categories with counts, brands with counts, price min/max)
export const getCachedShopFilterData = unstable_cache(
  async () => {
    const [allCategories, allBrands, priceAgg] = await Promise.all([
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
          _count: {
            select: { products: { where: { isDeleted: false } } }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.brand.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { products: { where: { isDeleted: false } } }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.product.aggregate({
        where: { isDeleted: false },
        _min: { price: true },
        _max: { price: true }
      })
    ]);

    return {
      allCategories,
      allBrands,
      globalMinPrice: Math.floor(priceAgg._min?.price || 0),
      globalMaxPrice: Math.ceil(priceAgg._max?.price || 1000)
    };
  },
  ['shop-filter-metadata'],
  { tags: ['products', 'categories', 'brands'], revalidate: 3600 }
);

// Cached Hot products (sorted by orders count)
export const getCachedHotProducts = unstable_cache(
  async (limit: number = 40) => {
    return prisma.product.findMany({
      where: { isDeleted: false },
      select: PRODUCT_CARD_SELECT,
      orderBy: {
        orderItems: {
          _count: 'desc'
        }
      },
      take: limit
    });
  },
  ['cached-hot-products'],
  { tags: ['products'], revalidate: 3600 }
);

// Cached New products (sorted by createdAt)
export const getCachedNewProducts = unstable_cache(
  async (limit: number = 40) => {
    return prisma.product.findMany({
      where: { isDeleted: false },
      select: PRODUCT_CARD_SELECT,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  },
  ['cached-new-products'],
  { tags: ['products'], revalidate: 3600 }
);

// Cached Sale products (with compareAtPrice)
export const getCachedSaleProducts = unstable_cache(
  async (limit: number = 40) => {
    return prisma.product.findMany({
      where: {
        isDeleted: false,
        compareAtPrice: { not: null }
      },
      select: PRODUCT_CARD_SELECT,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  },
  ['cached-sale-products'],
  { tags: ['products'], revalidate: 3600 }
);
