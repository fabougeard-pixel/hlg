import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export interface CategoryWithHierarchy {
  id: string;
  name: string;
  slug: string | null;
  parentId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
}

export const getCachedAllCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
      }
    });
  },
  ['all-categories-hierarchy'],
  { tags: ['categories'], revalidate: 3600 }
);

/**
 * Computes the full hierarchical path for a category (RankMath Strip Category Base style)
 * e.g. /combustiveis/lenha-e-pellets
 */
export async function getCategoryCanonicalPath(
  category: { id: string; slug: string | null; parentId: string | null },
  allCategories?: CategoryWithHierarchy[]
): Promise<string> {
  const cats = allCategories || (await getCachedAllCategories());
  const catMap = new Map(cats.map(c => [c.id, c]));

  const segments: string[] = [category.slug || category.id];
  let currentParentId = category.parentId;

  while (currentParentId && catMap.has(currentParentId)) {
    const parent = catMap.get(currentParentId)!;
    if (parent.slug) {
      segments.unshift(parent.slug);
    }
    currentParentId = parent.parentId;
  }

  return `/${segments.join('/')}`;
}

/**
 * Resolves a category given a path array of segments like ['combustiveis', 'lenha-e-pellets']
 * or a single segment like ['combustiveis']
 */
export async function getCategoryByPathSegments(segments: string[]) {
  if (!segments || segments.length === 0) return null;

  const cats = await getCachedAllCategories();
  const catBySlug = new Map(cats.filter(c => c.slug).map(c => [c.slug!, c]));
  const catById = new Map(cats.map(c => [c.id, c]));

  // The active/target category is always the last segment
  const targetSlug = decodeURIComponent(segments[segments.length - 1]).toLowerCase();

  const targetCategory = catBySlug.get(targetSlug) || catById.get(targetSlug);
  if (!targetCategory) return null;

  // If there are multiple segments, verify hierarchy if possible
  if (segments.length > 1) {
    let curr = targetCategory;
    for (let i = segments.length - 2; i >= 0; i--) {
      const expectedParentSlug = decodeURIComponent(segments[i]).toLowerCase();
      if (!curr.parentId) break;
      const parent = catById.get(curr.parentId);
      if (parent && parent.slug && parent.slug.toLowerCase() === expectedParentSlug) {
        curr = parent;
      }
    }
  }

  return targetCategory;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeCategoryLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves a category by UUID, slug (case-insensitive / umlaut-normalized), or name,
 * and returns the matched category together with its ID and all descendant subcategory IDs.
 */
export async function resolveCategoryFilter(categoryIdOrSlug: string): Promise<{
  category: CategoryWithHierarchy | null;
  ids: string[];
}> {
  let decoded = (categoryIdOrSlug || '').trim();
  if (!decoded || decoded === 'all') {
    return { category: null, ids: [] };
  }
  try {
    decoded = decodeURIComponent(decoded).trim();
  } catch {
    // Keep trimmed value if malformed URI sequence
  }

  const lower = decoded.toLowerCase();
  const normalizedTarget = normalizeCategoryLookupKey(decoded);

  const cats = await getCachedAllCategories();
  const catById = new Map(cats.map(c => [c.id, c]));

  let rootCat: CategoryWithHierarchy | undefined =
    catById.get(decoded) ||
    cats.find(c => c.slug && c.slug.toLowerCase() === lower) ||
    (normalizedTarget.length > 0
      ? cats.find(
          c =>
            (c.slug && normalizeCategoryLookupKey(c.slug) === normalizedTarget) ||
            normalizeCategoryLookupKey(c.name) === normalizedTarget
        )
      : undefined);

  // Fallback directly to DB if cached tree did not include a newly created category
  if (!rootCat) {
    const dbMatch = await prisma.category.findFirst({
      where: UUID_REGEX.test(decoded)
        ? { id: decoded }
        : {
            OR: [
              { slug: { equals: decoded, mode: 'insensitive' } },
              { name: { equals: decoded, mode: 'insensitive' } },
            ],
          },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
      },
    });
    if (dbMatch) {
      rootCat = dbMatch;
    }
  }

  if (!rootCat) {
    return { category: null, ids: [] };
  }

  const resultIds: string[] = [rootCat.id];
  const queue: string[] = [rootCat.id];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = cats.filter(c => c.parentId === currentId);
    for (const child of children) {
      if (!resultIds.includes(child.id)) {
        resultIds.push(child.id);
        queue.push(child.id);
      }
    }
  }

  return { category: rootCat, ids: resultIds };
}

/**
 * Collects a category ID and all its descendant subcategory IDs
 */
export async function getCategoryWithDescendantIds(categoryIdOrSlug: string): Promise<string[]> {
  const { ids } = await resolveCategoryFilter(categoryIdOrSlug);
  return ids;
}

