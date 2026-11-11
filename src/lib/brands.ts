import prisma from '@/lib/prisma';
import type { CatalogBrandSummary } from '@/components/home/categorySectionData';

/**
 * Fetches all brands with active (non-deleted) product counts for homepage & preview sections.
 */
export async function getCatalogBrandSummaries(): Promise<CatalogBrandSummary[]> {
  try {
    const rows = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        _count: {
          select: {
            products: {
              where: { isDeleted: false },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return rows.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      productCount: b._count.products,
    }));
  } catch (e) {
    console.error('Failed to fetch catalog brand summaries:', e);
    return [];
  }
}

