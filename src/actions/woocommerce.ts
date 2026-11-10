'use server';

import prisma from '@/lib/prisma';
import { slugify, unescapeHtml } from '@/lib/utils';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';
import { getTranslations } from 'next-intl/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper to extract a clean original filename without random hash
 */
function extractOriginalFilename(url: string, fallbackName?: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const baseWithExt = pathname.split('/').pop() || '';
    const lastDot = baseWithExt.lastIndexOf('.');
    let base = lastDot > 0 ? baseWithExt.substring(0, lastDot) : baseWithExt;

    // Remove WordPress thumbnail dimensions suffix like -1024x768 or -300x300
    base = base.replace(/-\d+x\d+$/, '');
    // Remove -scaled suffix
    base = base.replace(/-scaled$/, '');

    try {
      base = decodeURIComponent(base);
    } catch {}

    const sanitized = slugify(base);
    if (sanitized && sanitized.length > 1) {
      return sanitized;
    }
  } catch (e) {
    // URL parsing fallback
  }

  if (fallbackName) {
    const sanitizedFallback = slugify(fallbackName);
    if (sanitizedFallback && sanitizedFallback.length > 1) {
      return sanitizedFallback;
    }
  }

  return 'media-' + Date.now();
}

/**
 * Helper to upload an image from a URL to Cloudinary preserving the original filename
 */
async function uploadImageFromUrlToCloudinary(
  imageUrl: string,
  preferredName?: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const publicId = extractOriginalFilename(imageUrl, preferredName);

    return new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'hlg/woocommerce-import',
          public_id: publicId,
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error(`Error downloading/uploading image ${imageUrl}:`, error);
    return null;
  }
}

/**
 * Helper to extract RankMath and Yoast SEO metadata from WooCommerce product/category meta_data
 * or WordPress page/post meta objects / root properties.
 */
function extractRankMathSEO(
  metaSource: any,
  item: {
    name?: string;
    title?: string | { rendered?: string };
    description?: string | { rendered?: string };
    short_description?: string | { rendered?: string };
    excerpt?: string | { rendered?: string };
    price?: string | number;
    yoast_head_json?: any;
    head_tags?: any[];
    rank_math_title?: string;
    rank_math_description?: string;
    rank_math_focus_keyword?: string;
    meta?: any;
    meta_data?: any[];
  },
  storeName: string = 'HLG Hausgeräte'
) {
  let rawTitle: string | null = null;
  let rawDesc: string | null = null;
  let rawKeywords: string | null = null;
  let gtin: string | null = null;

  // 1. If metaSource or item.meta_data is an array of { key, value } (standard WooCommerce meta_data)
  const metaArray = Array.isArray(metaSource) 
    ? metaSource 
    : (Array.isArray(item.meta_data) ? item.meta_data : null);

  if (metaArray) {
    for (const meta of metaArray) {
      if (!meta || !meta.key) continue;
      const key = String(meta.key).trim().toLowerCase();
      const val = typeof meta.value === 'string' ? meta.value.trim() : null;
      if (!val) continue;

      // RankMath fields
      if (key === 'rank_math_title') rawTitle = val;
      if (key === 'rank_math_description') rawDesc = val;
      if (key === 'rank_math_focus_keyword') rawKeywords = val;

      // Yoast SEO fallback fields
      if (!rawTitle && (key === '_yoast_wpseo_title' || key === 'yoast_wpseo_title')) rawTitle = val;
      if (!rawDesc && (key === '_yoast_wpseo_metadesc' || key === 'yoast_wpseo_metadesc')) rawDesc = val;
      if (!rawKeywords && (key === '_yoast_wpseo_focuskw' || key === 'yoast_wpseo_focuskw')) rawKeywords = val;

      // GTIN / EAN / Barcode
      if (!gtin && (key === '_gtin' || key === 'gtin' || key === '_ean' || key === 'ean' || key === '_barcode' || key === 'barcode' || key === 'hwp_gtin' || key === 'hwp_product_gtin')) {
        gtin = val;
      }
    }
  }

  // 2. If metaSource or item.meta is an object (standard WordPress REST API meta object)
  const metaObj = (metaSource && typeof metaSource === 'object' && !Array.isArray(metaSource)) 
    ? metaSource 
    : (item.meta && typeof item.meta === 'object' && !Array.isArray(item.meta) ? item.meta : null);

  if (metaObj) {
    if (!rawTitle && typeof metaObj.rank_math_title === 'string' && metaObj.rank_math_title.trim()) {
      rawTitle = metaObj.rank_math_title.trim();
    }
    if (!rawDesc && typeof metaObj.rank_math_description === 'string' && metaObj.rank_math_description.trim()) {
      rawDesc = metaObj.rank_math_description.trim();
    }
    if (!rawKeywords && typeof metaObj.rank_math_focus_keyword === 'string' && metaObj.rank_math_focus_keyword.trim()) {
      rawKeywords = metaObj.rank_math_focus_keyword.trim();
    }
    if (!rawTitle && typeof metaObj._yoast_wpseo_title === 'string' && metaObj._yoast_wpseo_title.trim()) {
      rawTitle = metaObj._yoast_wpseo_title.trim();
    }
    if (!rawDesc && typeof metaObj._yoast_wpseo_metadesc === 'string' && metaObj._yoast_wpseo_metadesc.trim()) {
      rawDesc = metaObj._yoast_wpseo_metadesc.trim();
    }
    if (!rawKeywords && typeof metaObj._yoast_wpseo_focuskw === 'string' && metaObj._yoast_wpseo_focuskw.trim()) {
      rawKeywords = metaObj._yoast_wpseo_focuskw.trim();
    }
  }

  // 3. Direct properties on item (e.g. item.rank_math_title)
  if (!rawTitle && typeof item.rank_math_title === 'string' && item.rank_math_title.trim()) {
    rawTitle = item.rank_math_title.trim();
  }
  if (!rawDesc && typeof item.rank_math_description === 'string' && item.rank_math_description.trim()) {
    rawDesc = item.rank_math_description.trim();
  }
  if (!rawKeywords && typeof item.rank_math_focus_keyword === 'string' && item.rank_math_focus_keyword.trim()) {
    rawKeywords = item.rank_math_focus_keyword.trim();
  }

  // 4. Fallback to yoast_head_json (often exposed by RankMath or Yoast)
  if (item.yoast_head_json && typeof item.yoast_head_json === 'object') {
    if (!rawTitle && item.yoast_head_json.title) {
      rawTitle = String(item.yoast_head_json.title).trim();
    }
    if (!rawDesc && item.yoast_head_json.description) {
      rawDesc = String(item.yoast_head_json.description).trim();
    }
    if (!rawDesc && item.yoast_head_json.og_description) {
      rawDesc = String(item.yoast_head_json.og_description).trim();
    }
  }

  // 5. Fallback to head_tags array
  if (Array.isArray(item.head_tags)) {
    for (const tag of item.head_tags) {
      if (!rawTitle && tag.tag === 'title' && tag.content) {
        rawTitle = String(tag.content).trim();
      }
      if (!rawDesc && tag.tag === 'meta' && tag.attributes?.name === 'description' && tag.attributes?.content) {
        rawDesc = String(tag.attributes.content).trim();
      }
    }
  }

  // Helper to extract clean text from string or { rendered: string }
  const getCleanText = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.rendered) return String(val.rendered);
    return String(val);
  };

  const cleanName = unescapeHtml(getCleanText(item.name || item.title)).trim();
  const cleanExcerpt = getCleanText(item.short_description || item.excerpt || item.description)
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .substring(0, 160)
    .trim();

  const replaceVars = (str: string | null) => {
    if (!str) return null;
    return str
      .replace(/%title%/gi, cleanName)
      .replace(/%%title%%/gi, cleanName)
      .replace(/%sep%/gi, '|')
      .replace(/%%sep%%/gi, '|')
      .replace(/%sitename%/gi, storeName)
      .replace(/%%sitename%%/gi, storeName)
      .replace(/%excerpt%/gi, cleanExcerpt)
      .replace(/%%excerpt%%/gi, cleanExcerpt)
      .replace(/%primary_category%/gi, '')
      .replace(/%%primary_category%%/gi, '')
      .replace(/%category%/gi, '')
      .replace(/%%category%%/gi, '')
      .replace(/%focuskw%/gi, rawKeywords || '')
      .replace(/%price%/gi, item.price ? `${item.price} €` : '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  return {
    metaTitle: replaceVars(rawTitle) || (cleanName ? `${cleanName} | ${storeName}` : null),
    metaDescription: replaceVars(rawDesc) || (cleanExcerpt ? cleanExcerpt : null),
    metaKeywords: rawKeywords || null,
    gtin
  };
}

/**
 * Generates a unique slug
 */
async function generateUniqueSlug(baseSlug: string) {
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

/**
 * Safely find or create a Category without Unique constraint collisions on name or slug
 */
async function findOrCreateCategory(rawName: string, rawSlug?: string | null) {
  const name = unescapeHtml(rawName || '').trim();
  const slug = (rawSlug && rawSlug.trim()) || slugify(name);

  // 1. Try to find by name or slug
  let category = await prisma.category.findFirst({
    where: {
      OR: [
        { name: name },
        { slug: slug }
      ]
    }
  });

  if (category) {
    return category;
  }

  // 2. If creating, ensure both name and slug are unique across the table
  let finalSlug = slug;
  let slugCounter = 1;
  while (await prisma.category.findFirst({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${slugCounter}`;
    slugCounter++;
  }

  let finalName = name;
  let nameCounter = 1;
  while (await prisma.category.findFirst({ where: { name: finalName } })) {
    finalName = `${name} (${nameCounter})`;
    nameCounter++;
  }

  return await prisma.category.create({
    data: {
      name: finalName,
      slug: finalSlug,
    }
  });
}

/**
 * Safely find or create a Brand without Unique constraint collisions on name or slug
 */
async function findOrCreateBrand(rawName: string, rawSlug?: string | null) {
  const name = unescapeHtml(rawName || '').trim();
  const slug = (rawSlug && rawSlug.trim()) || slugify(name);

  let brand = await prisma.brand.findFirst({
    where: {
      OR: [
        { name: name },
        { slug: slug }
      ]
    }
  });

  if (brand) {
    return brand;
  }

  let finalSlug = slug;
  let slugCounter = 1;
  while (await prisma.brand.findFirst({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${slugCounter}`;
    slugCounter++;
  }

  let finalName = name;
  let nameCounter = 1;
  while (await prisma.brand.findFirst({ where: { name: finalName } })) {
    finalName = `${name} (${nameCounter})`;
    nameCounter++;
  }

  return await prisma.brand.create({
    data: {
      name: finalName,
      slug: finalSlug,
    }
  });
}

/**
 * Test WooCommerce API connection
 */
export type WcProductImportItemResult = {
  id: number;
  name: string;
  status: 'SUCCESS' | 'ALREADY_EXISTS' | 'FAILED';
  error?: string;
  image?: string | null;
  price?: string | number;
};

export interface ProcessWcProductsResult {
  importedCount: number;
  alreadyExistsCount: number;
  failedCount: number;
  items: WcProductImportItemResult[];
}

export async function testWooCommerceConnection(url: string, consumerKey: string, consumerSecret: string) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wc/v3/system_status`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return { success: false, message: `Connexion refusée : ${response.status} ${response.statusText}` };
    }

    return { success: true, message: 'Connexion réussie à l\'API WooCommerce !' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Impossible de joindre le serveur WooCommerce.' };
  }
}

/**
 * Fetch remote categories list with product count
 */
export async function fetchWooCommerceCategoriesList(url: string, consumerKey: string, consumerSecret: string) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wc/v3/products/categories`;

  try {
    let allCategories: Array<{ id: number; name: string; count: number; slug: string }> = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) {
      const response = await fetch(`${apiUrl}?per_page=100&page=${page}&hide_empty=false`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erreur API WooCommerce: ${response.status} ${response.statusText}`);
      }

      const cats = await response.json();
      if (!Array.isArray(cats) || cats.length === 0) {
        hasMore = false;
      } else {
        cats.forEach((c: any) => {
          allCategories.push({
            id: c.id,
            name: unescapeHtml(c.name),
            count: c.count || 0,
            slug: c.slug
          });
        });
        page++;
      }
    }

    return { success: true, categories: allCategories };
  } catch (error: any) {
    console.error('Error fetching categories list:', error);
    return { success: false, message: error.message || 'Erreur lors de la récupération des catégories.' };
  }
}

/**
 * Fetch remote products list for individual selection (supports search & pagination)
 */
export async function fetchWooCommerceProductsList(
  url: string,
  consumerKey: string,
  consumerSecret: string,
  search: string = '',
  page: number = 1,
  categoryFilter?: number
) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  let apiUrl = `${baseUrl}/wp-json/wc/v3/products?per_page=20&page=${page}`;

  if (search) {
    apiUrl += `&search=${encodeURIComponent(search)}`;
  }
  if (categoryFilter) {
    apiUrl += `&category=${categoryFilter}`;
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Erreur API WooCommerce: ${response.status} ${response.statusText}`);
    }

    const total = parseInt(response.headers.get('x-wp-total') || '0', 10);
    const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);

    const prods = await response.json();
    if (!Array.isArray(prods)) {
      return { success: true, products: [], total: 0, totalPages: 0 };
    }

    // Check which ones are already in local DB (comparing both decoded and raw titles)
    const rawTitles = prods.map(p => p.name);
    const decodedTitles = prods.map(p => unescapeHtml(p.name));
    const allTitlesToCheck = Array.from(new Set([...rawTitles, ...decodedTitles]));

    const existing = await prisma.product.findMany({
      where: { title: { in: allTitlesToCheck } },
      select: { title: true }
    });
    const existingTitles = new Set(existing.map(e => e.title));

    const products = prods.map((p: any) => {
      const decodedName = unescapeHtml(p.name);
      return {
        id: p.id,
        name: decodedName,
        price: p.price || p.regular_price || '0',
        image: (p.images && p.images[0]?.src) ? p.images[0].src : null,
        categories: (p.categories || []).map((c: any) => unescapeHtml(c.name)),
        alreadyImported: existingTitles.has(decodedName) || existingTitles.has(p.name)
      };
    });

    return { success: true, products, total, totalPages };
  } catch (error: any) {
    console.error('Error fetching products list:', error);
    return { success: false, message: error.message || 'Erreur lors de la récupération des produits.' };
  }
}

/**
 * Import categories from WooCommerce to create/update local category tree.
 * If categoryIds is provided, only those categories (and their parent hierarchy) are imported.
 */
export async function importWooCommerceCategories(
  url: string,
  consumerKey: string,
  consumerSecret: string,
  categoryIds?: number[]
) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wc/v3/products/categories`;

  try {
    let allCategories: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 20) {
      const response = await fetch(`${apiUrl}?per_page=100&page=${page}`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erreur API WooCommerce (Catégories): ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text().catch(() => 'Impossible de lire le corps de la réponse');
        console.error(`WooCommerce API HTML response: ${text.substring(0, 500)}...`);
        const t = await getTranslations('AdminCategories');
        throw new Error(t('woo_import_cat_html_error') + ` (Content-Type: ${contentType})`);
      }

      const cats = await response.json();
      if (cats.length === 0) {
        hasMore = false;
      } else {
        allCategories = [...allCategories, ...cats];
        page++;
      }
    }

    if (allCategories.length === 0) return { success: true, count: 0 };

    // If specific categoryIds were requested, filter down to only those categories and their ancestor hierarchy
    let categoriesToImport = allCategories;
    if (categoryIds && categoryIds.length > 0) {
      const selectedIdSet = new Set<number>(categoryIds);
      const catById = new Map<number, any>(allCategories.map(c => [c.id, c]));
      const neededIds = new Set<number>();

      // Traverse each selected category and include all its parents
      for (const id of categoryIds) {
        let curr = catById.get(id);
        while (curr) {
          neededIds.add(curr.id);
          if (curr.parent && curr.parent > 0) {
            curr = catById.get(curr.parent);
          } else {
            break;
          }
        }
      }

      categoriesToImport = allCategories.filter(c => neededIds.has(c.id));
    }

    if (categoriesToImport.length === 0) return { success: true, count: 0 };

    // 1st Pass: Create all filtered categories to get their UUIDs
    const wcIdToUuidMap: Record<number, string> = {};

    for (const wcCat of categoriesToImport) {
      const category = await findOrCreateCategory(wcCat.name, wcCat.slug);
      wcIdToUuidMap[wcCat.id] = category.id;

      // Extract and update SEO metadata from RankMath / Yoast
      const catSeo = extractRankMathSEO(wcCat.meta_data, wcCat);
      if (catSeo.metaTitle || catSeo.metaDescription || catSeo.metaKeywords) {
        await prisma.category.update({
          where: { id: category.id },
          data: {
            ...(catSeo.metaTitle ? { metaTitle: catSeo.metaTitle } : {}),
            ...(catSeo.metaDescription ? { metaDescription: catSeo.metaDescription } : {}),
            ...(catSeo.metaKeywords ? { metaKeywords: catSeo.metaKeywords } : {}),
          }
        });
      }
    }

    // 2nd Pass: Link parents
    for (const wcCat of categoriesToImport) {
      if (wcCat.parent && wcCat.parent > 0) {
        const parentUuid = wcIdToUuidMap[wcCat.parent];
        const childUuid = wcIdToUuidMap[wcCat.id];

        if (parentUuid && childUuid) {
          await prisma.category.update({
            where: { id: childUuid },
            data: { parentId: parentUuid }
          });
        }
      }
    }

    revalidatePath('/admin/categories');
    return { success: true, count: categoriesToImport.length };

  } catch (error: any) {
    console.error('Error importing categories from WooCommerce:', error);
    return { success: false, message: error.message || 'Une erreur est survenue lors de l\'importation des catégories.' };
  }
}

/**
 * Gets the total number of products to import (optionally filtered by categories)
 */
export async function countWooCommerceProducts(
  url: string,
  consumerKey: string,
  consumerSecret: string,
  categoryIds?: number[]
) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  let apiUrl = `${baseUrl}/wp-json/wc/v3/products?per_page=1`;

  if (categoryIds && categoryIds.length > 0) {
    apiUrl += `&category=${categoryIds.join(',')}`;
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Erreur API WooCommerce: ${response.status} ${response.statusText}`);
    }

    const totalStr = response.headers.get('x-wp-total');
    if (!totalStr) {
      return { success: false, message: "Impossible de déterminer le nombre total de produits (header x-wp-total manquant)." };
    }

    const total = parseInt(totalStr, 10);
    return { success: true, total };
  } catch (error: any) {
    console.error('Error counting WooCommerce products:', error);
    return { success: false, message: error.message || 'Une erreur inattendue est survenue.' };
  }
}

/**
 * Helper to process and import an array of WooCommerce product objects into Prisma
 */
async function processAndSaveWcProducts(
  products: any[],
  apiUrl: string,
  consumerKey: string,
  consumerSecret: string,
  allowedCategoryIds?: number[]
): Promise<ProcessWcProductsResult> {
  let importedCount = 0;
  let alreadyExistsCount = 0;
  let failedCount = 0;
  const items: WcProductImportItemResult[] = [];

  const allowedSet = (allowedCategoryIds && allowedCategoryIds.length > 0) ? new Set(allowedCategoryIds) : null;

  for (const wcProduct of products) {
    const decodedTitle = unescapeHtml(wcProduct.name || '');
    const rawTitle = wcProduct.name || '';
    const imgUrl = (wcProduct.images && wcProduct.images[0]?.src) ? wcProduct.images[0].src : null;
    const priceVal = wcProduct.price || wcProduct.regular_price || '0';

    try {
      // 1. Extract SEO metadata from RankMath / Yoast
      const seo = extractRankMathSEO(wcProduct.meta_data, wcProduct);

      // Check if product with same title or slug already exists on destination site
      const baseSlug = wcProduct.slug || slugify(decodedTitle);
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { title: decodedTitle },
            { title: rawTitle },
            { slug: baseSlug }
          ]
        },
        select: { id: true, title: true }
      });

      if (existingProduct) {
        // Synchronize SEO & GTIN metadata on existing product
        if (seo.metaTitle || seo.metaDescription || seo.gtin) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              ...(seo.metaTitle ? { metaTitle: seo.metaTitle } : {}),
              ...(seo.metaDescription ? { metaDescription: seo.metaDescription } : {}),
              ...(seo.gtin ? { gtin: seo.gtin } : {}),
            }
          });
        }

        items.push({
          id: wcProduct.id,
          name: decodedTitle,
          status: 'ALREADY_EXISTS',
          image: imgUrl,
          price: priceVal
        });
        alreadyExistsCount++;
        continue; // Skip creating duplicate product
      }

      // 2. Process Categories
      const categoryIds: string[] = [];
      if (wcProduct.categories && Array.isArray(wcProduct.categories)) {
        for (const wcCat of wcProduct.categories) {
          if (allowedSet && !allowedSet.has(wcCat.id)) {
            continue;
          }

          const category = await findOrCreateCategory(wcCat.name, wcCat.slug);
          categoryIds.push(category.id);
        }
      }

      // 3. Process Brands
      let brandId: string | null = null;
      let brandName: string | null = null;
      let brandSlug: string | null = null;

      if (wcProduct.brands && Array.isArray(wcProduct.brands) && wcProduct.brands.length > 0) {
        brandName = wcProduct.brands[0].name;
        brandSlug = wcProduct.brands[0].slug;
      } else if (wcProduct.attributes && Array.isArray(wcProduct.attributes)) {
        const brandAttr = wcProduct.attributes.find((a: any) =>
          a.name.toLowerCase() === 'brand' ||
          a.name.toLowerCase() === 'marque' ||
          a.name.toLowerCase() === 'brands' ||
          a.name.toLowerCase() === 'marques'
        );
        if (brandAttr && brandAttr.options && brandAttr.options.length > 0) {
          brandName = brandAttr.options[0];
          brandSlug = brandName ? brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : null;
        }
      }

      if (brandName) {
        const brand = await findOrCreateBrand(brandName, brandSlug);
        brandId = brand.id;
      }

      // 4. Process Images
      const cloudinaryImageUrls: string[] = [];
      if (wcProduct.images && Array.isArray(wcProduct.images)) {
        const uploadPromises = wcProduct.images.map(async (wcImg: any, idx: number) => {
          if (!wcImg.src) return null;
          try {
            const preferredName = wcImg.name ? unescapeHtml(wcImg.name) : `${baseSlug}-${idx + 1}`;
            const secureUrl = await uploadImageFromUrlToCloudinary(wcImg.src, preferredName);
            if (secureUrl) {
              const originalFileName = extractOriginalFilename(wcImg.src, preferredName);
              const imgAlt = wcImg.alt ? unescapeHtml(wcImg.alt) : decodedTitle;
              const imgTitle = wcImg.name ? unescapeHtml(wcImg.name) : decodedTitle;
              await prisma.media.upsert({
                where: { url: secureUrl },
                update: {
                  title: imgTitle,
                  altText: imgAlt,
                  legend: originalFileName,
                },
                create: {
                  url: secureUrl,
                  title: imgTitle,
                  altText: imgAlt,
                  legend: originalFileName,
                }
              });
              return secureUrl;
            }
          } catch (uploadErr) {
            console.warn(`[WooCommerce Import] Image upload failed for ${wcImg.src}:`, uploadErr);
          }
          return null;
        });

        const results = await Promise.all(uploadPromises);
        results.forEach((url) => {
          if (url) cloudinaryImageUrls.push(url as string);
        });
      }

      const uniqueSlug = await generateUniqueSlug(baseSlug);
      const price = parseFloat(wcProduct.price || wcProduct.regular_price || '0');
      const compareAtPrice = parseFloat(wcProduct.regular_price || '0');

      let stock: number | null = null;
      if (wcProduct.manage_stock && wcProduct.stock_quantity !== null) {
        stock = parseInt(wcProduct.stock_quantity, 10);
      }

      // 5. Tags
      const tags: string[] = [];
      if (wcProduct.tags && Array.isArray(wcProduct.tags)) {
        wcProduct.tags.forEach((t: any) => {
          if (t && t.name) tags.push(t.name);
        });
      }

      // 6. Attributes
      let parsedAttributes: any[] = [];
      if (wcProduct.attributes && Array.isArray(wcProduct.attributes)) {
        parsedAttributes = wcProduct.attributes
          .filter((attr: any) => attr.variation)
          .map((attr: any) => ({
            name: attr.name,
            options: attr.options
          }));
      }

      // 7. Variations
      let parsedVariations: any[] = [];
      if (wcProduct.type === 'variable') {
        try {
          const varResponse = await fetch(`${apiUrl}/${wcProduct.id}/variations`, {
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
          if (varResponse.ok) {
            const wcVariations = await varResponse.json();
            if (Array.isArray(wcVariations)) {
              parsedVariations = await Promise.all(wcVariations.map(async (wcVar: any) => {
                const attrMap: Record<string, string> = {};
                if (wcVar.attributes && Array.isArray(wcVar.attributes)) {
                  wcVar.attributes.forEach((a: any) => {
                    attrMap[a.name] = a.option;
                  });
                }

                let varImage = undefined;
                if (wcVar.image && wcVar.image.src) {
                  try {
                    const varOptions = Object.values(attrMap).filter(Boolean).join('-');
                    const preferredVarName = wcVar.image.name 
                      ? unescapeHtml(wcVar.image.name) 
                      : `${baseSlug}-${varOptions || wcVar.id}`;
                    const secureUrl = await uploadImageFromUrlToCloudinary(wcVar.image.src, preferredVarName);
                    if (secureUrl) {
                      varImage = secureUrl;
                      const varOptionsLabel = Object.values(attrMap).filter(Boolean).join(', ');
                      const varTitle = `${decodedTitle}${varOptionsLabel ? ` (${varOptionsLabel})` : ''}`;
                      const varAlt = wcVar.image.alt ? unescapeHtml(wcVar.image.alt) : varTitle;
                      const originalVarName = extractOriginalFilename(wcVar.image.src, preferredVarName);
                      await prisma.media.upsert({
                        where: { url: secureUrl },
                        update: {
                          title: varTitle,
                          altText: varAlt,
                          legend: originalVarName,
                        },
                        create: {
                          url: secureUrl,
                          title: varTitle,
                          altText: varAlt,
                          legend: originalVarName,
                        }
                      });
                    }
                  } catch (e) {
                    console.warn(`[WooCommerce Import] Variation image upload failed for var ${wcVar.id}:`, e);
                  }
                }

                return {
                  id: String(wcVar.id),
                  attributes: attrMap,
                  price: parseFloat(wcVar.price || wcVar.regular_price || '0'),
                  stock: (wcVar.manage_stock && wcVar.stock_quantity !== null) ? parseInt(wcVar.stock_quantity, 10) : null,
                  image: varImage
                };
              }));
            }
          }
        } catch (err) {
          console.error(`Failed to fetch variations for product ${wcProduct.id}`, err);
        }
      }

      // 8. Create Product in Prisma
      const createdProduct = await prisma.product.create({
        data: {
          title: decodedTitle,
          slug: uniqueSlug,
          description: wcProduct.description || '',
          shortDescription: wcProduct.short_description || '',
          price: price,
          compareAtPrice: (compareAtPrice > price) ? compareAtPrice : null,
          images: cloudinaryImageUrls,
          stock: stock,
          type: wcProduct.type === 'variable' ? 'VARIABLE' : 'SIMPLE',
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          gtin: seo.gtin,
          tags: {
            connectOrCreate: tags.map((t: string) => ({
              where: { name: t },
              create: { name: t, slug: slugify(t) }
            }))
          },
          brandId: brandId,
          attributes: parsedAttributes.length > 0 ? parsedAttributes : undefined,
          variations: parsedVariations.length > 0 ? parsedVariations : undefined,
          categories: {
            connect: categoryIds.map(id => ({ id }))
          }
        }
      });

      // 9. Import reviews
      try {
        const reviewsResponse = await fetch(`${apiUrl}/reviews?product=${wcProduct.id}`, {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        if (reviewsResponse.ok) {
          const wcReviews = await reviewsResponse.json();
          if (Array.isArray(wcReviews) && wcReviews.length > 0) {
            const reviewsToInsert = wcReviews
              .filter(r => r.status === 'approved')
              .map(r => ({
                productId: createdProduct.id,
                reviewerName: r.reviewer || null,
                reviewerEmail: r.reviewer_email || null,
                rating: r.rating || 5,
                comment: r.review ? r.review.replace(/(<([^>]+)>)/gi, "") : '',
                isApproved: true,
                createdAt: new Date(r.date_created)
              }));

            if (reviewsToInsert.length > 0) {
              await prisma.review.createMany({
                data: reviewsToInsert
              });
            }
          }
        }
      } catch (err) {
        console.error(`Failed to fetch reviews for product ${wcProduct.id}`, err);
      }

      items.push({
        id: wcProduct.id,
        name: decodedTitle,
        status: 'SUCCESS',
        image: cloudinaryImageUrls[0] || imgUrl,
        price: price
      });
      importedCount++;

    } catch (productError: any) {
      console.error(`Error importing product ${wcProduct.id} (${decodedTitle}):`, productError);
      items.push({
        id: wcProduct.id,
        name: decodedTitle,
        status: 'FAILED',
        error: productError?.message || 'Erreur inattendue lors de l\'enregistrement',
        image: imgUrl,
        price: priceVal
      });
      failedCount++;
    }
  }

  return {
    importedCount,
    alreadyExistsCount,
    failedCount,
    items
  };
}

export async function importWooCommerceProductsBatch(
  url: string,
  consumerKey: string,
  consumerSecret: string,
  page: number = 1,
  perPage: number = 5,
  categoryIds?: number[]
) {
  await requireAdmin();

  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wc/v3/products`;

  try {
    let queryUrl = `${apiUrl}?per_page=${perPage}&page=${page}`;
    if (categoryIds && categoryIds.length > 0) {
      queryUrl += `&category=${categoryIds.join(',')}`;
    }

    const response = await fetch(queryUrl, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Erreur API WooCommerce: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text().catch(() => 'Impossible de lire le corps de la réponse');
      console.error(`WooCommerce API HTML response (products): ${text.substring(0, 200)}...`);
      const t = await getTranslations('AdminProducts');
      throw new Error(t('woo_import_prod_html_error') + ` (Content-Type: ${contentType})`);
    }

    let products;
    try {
      products = await response.json();
    } catch (err) {
      const t = await getTranslations('AdminProducts');
      throw new Error(t('woo_import_parse_error'));
    }

    if (!Array.isArray(products) || products.length === 0) {
      return { success: true, count: 0, successCount: 0, alreadyExistsCount: 0, failedCount: 0, results: [] };
    }

    const batchResult = await processAndSaveWcProducts(products, apiUrl, consumerKey, consumerSecret, categoryIds);

    revalidatePath('/admin/products');
    revalidatePath('/');

    const { updateTag } = await import('next/cache');
    updateTag('products');
    updateTag('categories');

    return {
      success: true,
      count: batchResult.importedCount,
      successCount: batchResult.importedCount,
      alreadyExistsCount: batchResult.alreadyExistsCount,
      failedCount: batchResult.failedCount,
      results: batchResult.items
    };

  } catch (error: any) {
    console.error('Error importing batch from WooCommerce:', error);
    return { success: false, message: error.message || 'Une erreur inattendue est survenue.' };
  }
}

/**
 * Import specific product IDs directly
 */
export async function importWooCommerceSelectedProducts(
  url: string,
  consumerKey: string,
  consumerSecret: string,
  productIds: number[]
) {
  await requireAdmin();

  if (!productIds || productIds.length === 0) {
    return { success: true, count: 0, successCount: 0, alreadyExistsCount: 0, failedCount: 0, results: [] };
  }

  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wc/v3/products`;

  try {
    let totalImported = 0;
    let totalAlreadyExists = 0;
    let totalFailed = 0;
    const allResults: WcProductImportItemResult[] = [];

    // Chunk requests by 5 to respect Cloudinary & network timeout limits
    const chunkSize = 5;
    for (let i = 0; i < productIds.length; i += chunkSize) {
      const slice = productIds.slice(i, i + chunkSize);
      const queryUrl = `${apiUrl}?include=${slice.join(',')}&per_page=${chunkSize}`;

      const response = await fetch(queryUrl, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erreur API WooCommerce: ${response.status} ${response.statusText}`);
      }

      const products = await response.json();
      if (Array.isArray(products) && products.length > 0) {
        const batchResult = await processAndSaveWcProducts(products, apiUrl, consumerKey, consumerSecret);
        totalImported += batchResult.importedCount;
        totalAlreadyExists += batchResult.alreadyExistsCount;
        totalFailed += batchResult.failedCount;
        allResults.push(...batchResult.items);
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/');

    const { updateTag } = await import('next/cache');
    updateTag('products');
    updateTag('categories');

    return {
      success: true,
      count: totalImported,
      successCount: totalImported,
      alreadyExistsCount: totalAlreadyExists,
      failedCount: totalFailed,
      results: allResults
    };
  } catch (error: any) {
    console.error('Error importing specific products:', error);
    return { success: false, message: error.message || 'Erreur lors de l\'import des produits sélectionnés.' };
  }
}

/**
 * Import WooCommerce Orders
 */
export async function importWooCommerceOrders(
  url: string,
  consumerKey: string,
  consumerSecret: string
) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wc/v3/orders`;

  try {
    let totalImported = 0;
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 50) {
      const response = await fetch(`${apiUrl}?per_page=50&page=${page}`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erreur API WooCommerce Orders: ${response.status} ${response.statusText}`);
      }

      const orders = await response.json();
      if (!Array.isArray(orders) || orders.length === 0) {
        hasMore = false;
        break;
      }

      for (const wcOrder of orders) {
        const customerEmail = wcOrder.billing?.email || `customer-${wcOrder.customer_id || wcOrder.id}@hlg-hausgeraete.de`;

        let user = await prisma.user.findUnique({
          where: { email: customerEmail }
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: customerEmail,
              role: 'CUSTOMER',
              createdAt: new Date(wcOrder.date_created_gmt || wcOrder.date_created || Date.now())
            }
          });
        }

        let status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' = 'PENDING';
        switch (wcOrder.status) {
          case 'completed':
            status = 'DELIVERED';
            break;
          case 'processing':
            status = 'PROCESSING';
            break;
          case 'on-hold':
          case 'pending':
            status = 'PENDING';
            break;
          case 'cancelled':
          case 'refunded':
          case 'failed':
            status = 'CANCELLED';
            break;
          default:
            status = 'PROCESSING';
        }

        let paymentMethod: 'STRIPE' | 'PAYPAL' | 'BANK_TRANSFER' = 'STRIPE';
        if (wcOrder.payment_method === 'bacs' || wcOrder.payment_method === 'bank_transfer') {
          paymentMethod = 'BANK_TRANSFER';
        } else if (wcOrder.payment_method === 'paypal') {
          paymentMethod = 'PAYPAL';
        }

        const orderRef = `WC-${wcOrder.id}`;
        const existingOrder = await prisma.order.findUnique({
          where: { trackingNumber: orderRef }
        });

        if (existingOrder) {
          continue;
        }

        const destinationAddress = [
          wcOrder.shipping?.address_1 || wcOrder.billing?.address_1,
          wcOrder.shipping?.postcode || wcOrder.billing?.postcode,
          wcOrder.shipping?.city || wcOrder.billing?.city,
          wcOrder.shipping?.country || wcOrder.billing?.country
        ].filter(Boolean).join(', ');

        const createdOrder = await prisma.order.create({
          data: {
            userId: user.id,
            status,
            paymentMethod,
            total: parseFloat(wcOrder.total) || 0,
            trackingNumber: orderRef,
            destinationAddress: destinationAddress || null,
            destinationCountry: wcOrder.shipping?.country || wcOrder.billing?.country || 'PT',
            createdAt: new Date(wcOrder.date_created_gmt || wcOrder.date_created || Date.now()),
            updatedAt: new Date(wcOrder.date_modified_gmt || wcOrder.date_modified || Date.now())
          }
        });

        if (wcOrder.line_items && Array.isArray(wcOrder.line_items)) {
          for (const item of wcOrder.line_items) {
            const cleanItemName = unescapeHtml(item.name || '').trim();
            const baseItemName = cleanItemName.split(',')[0].trim();
            const itemSlug = slugify(cleanItemName);
            const baseSlug = slugify(baseItemName);

            // Robust multi-step product lookup to avoid phantom duplicates
            let product = await prisma.product.findFirst({
              where: {
                isDeleted: false,
                OR: [
                  { title: cleanItemName },
                  { title: item.name },
                  { slug: itemSlug },
                  ...(baseSlug ? [{ slug: baseSlug }, { slug: { startsWith: `${baseSlug}-` } }] : []),
                  ...(baseItemName.length > 5 ? [{ title: { contains: baseItemName, mode: 'insensitive' as const } }] : [])
                ]
              }
            });

            if (!product) {
              product = await prisma.product.create({
                data: {
                  title: cleanItemName,
                  slug: `${itemSlug}-${item.id}`,
                  price: parseFloat(item.price) || 0,
                  stock: 0,
                  description: item.name,
                  isDeleted: true,
                  deletedAt: new Date()
                }
              });
            }

            await prisma.orderItem.create({
              data: {
                orderId: createdOrder.id,
                productId: product.id,
                quantity: item.quantity || 1,
                price: parseFloat(item.price) || 0,
                attributes: item.meta_data ? item.meta_data : undefined
              }
            });
          }
        }

        totalImported++;
      }

      page++;
    }

    revalidatePath('/admin/orders');
    return { success: true, count: totalImported };
  } catch (error: any) {
    console.error('Error importing WooCommerce orders:', error);
    return { success: false, message: error.message || 'Erreur lors de l\'import des commandes.' };
  }
}

/**
 * Import WordPress Pages
 */
export async function importWordPressPages(
  url: string,
  consumerKey: string,
  consumerSecret: string
) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wp/v2/pages`;

  try {
    let totalImported = 0;
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) {
      const response = await fetch(`${apiUrl}?per_page=100&page=${page}`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erreur API WordPress Pages: ${response.status} ${response.statusText}`);
      }

      const pages = await response.json();
      if (!Array.isArray(pages) || pages.length === 0) {
        hasMore = false;
        break;
      }

      for (const wpPage of pages) {
        const title = unescapeHtml(wpPage.title?.rendered || '');
        const slug = wpPage.slug || slugify(title);
        const content = wpPage.content?.rendered || '';
        const excerpt = unescapeHtml(wpPage.excerpt?.rendered || '');

        const seo = extractRankMathSEO(
          wpPage.meta_data || wpPage.meta,
          wpPage,
          'HLG Hausgeräte'
        );

        await prisma.page.upsert({
          where: { slug },
          update: {
            title,
            desktopContent: content,
            mobileContent: content,
            isPublished: wpPage.status === 'publish',
            metaTitle: seo.metaTitle || (title ? `${title} | HLG Hausgeräte` : null),
            metaDescription: seo.metaDescription || (excerpt ? excerpt.slice(0, 160) : null),
            metaKeywords: seo.metaKeywords || null
          },
          create: {
            title,
            slug,
            desktopContent: content,
            mobileContent: content,
            isPublished: wpPage.status === 'publish',
            metaTitle: seo.metaTitle || (title ? `${title} | HLG Hausgeräte` : null),
            metaDescription: seo.metaDescription || (excerpt ? excerpt.slice(0, 160) : null),
            metaKeywords: seo.metaKeywords || null
          }
        });
        totalImported++;
      }
      page++;
    }

    revalidatePath('/admin/pages');
    return { success: true, count: totalImported };
  } catch (error: any) {
    console.error('Error importing WordPress pages:', error);
    return { success: false, message: error.message || 'Erreur lors de l\'import des pages.' };
  }
}

/**
 * Import WordPress Posts / Blog Articles
 */
export async function importWordPressArticles(
  url: string,
  consumerKey: string,
  consumerSecret: string
) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wp/v2/posts?_embed=true`;

  try {
    let totalImported = 0;
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) {
      const response = await fetch(`${apiUrl}&per_page=100&page=${page}`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erreur API WordPress Posts: ${response.status} ${response.statusText}`);
      }

      const posts = await response.json();
      if (!Array.isArray(posts) || posts.length === 0) {
        hasMore = false;
        break;
      }

      for (const wpPost of posts) {
        const title = unescapeHtml(wpPost.title?.rendered || '');
        const slug = wpPost.slug || slugify(title);
        const content = wpPost.content?.rendered || '';
        const excerpt = unescapeHtml(wpPost.excerpt?.rendered || '');

        let imageUrl: string | null = null;
        const mediaSource = wpPost._embedded?.['wp:featuredmedia']?.[0]?.source_url;
        const mediaDetails = wpPost._embedded?.['wp:featuredmedia']?.[0];
        if (mediaSource) {
          const preferredMediaName = mediaDetails?.slug || wpPost.slug || title;
          imageUrl = await uploadImageFromUrlToCloudinary(mediaSource, preferredMediaName);
          if (imageUrl) {
            const originalMediaName = extractOriginalFilename(mediaSource, preferredMediaName);
            const mediaAlt = mediaDetails?.alt_text ? unescapeHtml(mediaDetails.alt_text) : title;
            const mediaTitle = mediaDetails?.title?.rendered ? unescapeHtml(mediaDetails.title.rendered) : title;
            await prisma.media.upsert({
              where: { url: imageUrl },
              update: {
                title: mediaTitle,
                altText: mediaAlt,
                legend: originalMediaName,
              },
              create: {
                url: imageUrl,
                title: mediaTitle,
                altText: mediaAlt,
                legend: originalMediaName,
              }
            });
          }
        }

        // Category & tags extraction from _embedded['wp:term']
        let categoryName: string | null = null;
        const tags: string[] = [];
        if (wpPost._embedded?.['wp:term'] && Array.isArray(wpPost._embedded['wp:term'])) {
          for (const terms of wpPost._embedded['wp:term']) {
            if (Array.isArray(terms)) {
              for (const term of terms) {
                if (term.taxonomy === 'category' && !categoryName && term.name && term.name.toLowerCase() !== 'uncategorized' && term.name.toLowerCase() !== 'non classé') {
                  categoryName = unescapeHtml(term.name);
                } else if (term.taxonomy === 'post_tag' && term.name) {
                  tags.push(unescapeHtml(term.name));
                }
              }
            }
          }
        }

        // Author name extraction from _embedded['author']
        let authorName: string | null = null;
        if (wpPost._embedded?.['author']?.[0]?.name) {
          authorName = unescapeHtml(wpPost._embedded['author'][0].name);
        }

        const seo = extractRankMathSEO(
          wpPost.meta_data || wpPost.meta,
          wpPost,
          'HLG Hausgeräte'
        );

        await prisma.article.upsert({
          where: { slug },
          update: {
            title,
            content,
            excerpt,
            image: imageUrl,
            category: categoryName || 'Ratgeber',
            tags: tags,
            authorName: authorName || 'HLG Redaktion',
            isPublished: wpPost.status === 'publish',
            metaTitle: seo.metaTitle || (title ? `${title} | HLG Hausgeräte` : null),
            metaDescription: seo.metaDescription || (excerpt ? excerpt.slice(0, 160) : null),
            metaKeywords: seo.metaKeywords || null
          },
          create: {
            title,
            slug,
            content,
            excerpt,
            image: imageUrl,
            category: categoryName || 'Ratgeber',
            tags: tags,
            authorName: authorName || 'HLG Redaktion',
            isPublished: wpPost.status === 'publish',
            metaTitle: seo.metaTitle || (title ? `${title} | HLG Hausgeräte` : null),
            metaDescription: seo.metaDescription || (excerpt ? excerpt.slice(0, 160) : null),
            metaKeywords: seo.metaKeywords || null
          }
        });
        totalImported++;
      }
      page++;
    }

    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    return { success: true, count: totalImported };
  } catch (error: any) {
    console.error('Error importing WordPress articles:', error);
    return { success: false, message: error.message || 'Erreur lors de l\'import des articles.' };
  }
}

/**
 * Import WooCommerce Shipping Zones, Served Locations & Shipping Methods
 */
export async function importWooCommerceShipping(
  url: string,
  consumerKey: string,
  consumerSecret: string
) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const zonesUrl = `${baseUrl}/wp-json/wc/v3/shipping/zones`;
    const response = await fetch(zonesUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Erreur API WooCommerce Shipping Zones: ${response.status} ${response.statusText}`);
    }

    const zones = await response.json();
    let importedZonesCount = 0;
    let importedMethodsCount = 0;
    const importedSummary: any[] = [];

    // Array of all zone objects to process, including zone 0 (Rest of the World)
    const zonesToProcess = Array.isArray(zones) ? [...zones] : [];
    zonesToProcess.push({ id: 0, name: 'Outras Zonas (Resto do Mundo)' });

    for (const wcZone of zonesToProcess) {
      // 1. Fetch locations for the zone (if id > 0)
      let locationsSummary = '';
      if (wcZone.id > 0) {
        try {
          const locRes = await fetch(`${baseUrl}/wp-json/wc/v3/shipping/zones/${wcZone.id}/locations`, {
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
            cache: 'no-store'
          });
          if (locRes.ok) {
            const locData = await locRes.json();
            if (Array.isArray(locData) && locData.length > 0) {
              const codes = locData.map((l: any) => l.code).filter(Boolean);
              if (codes.length > 0) {
                locationsSummary = ` (${codes.join(', ')})`;
              }
            }
          }
        } catch (e) {
          console.warn(`Could not fetch locations for zone ${wcZone.id}`, e);
        }
      }

      // 2. Fetch shipping methods for this zone
      const methodsUrl = `${baseUrl}/wp-json/wc/v3/shipping/zones/${wcZone.id}/methods`;
      const methodsRes = await fetch(methodsUrl, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (!methodsRes.ok) {
        continue;
      }

      const methods = await methodsRes.json();
      if (!Array.isArray(methods) || methods.length === 0) {
        // If it's zone 0 and has no methods, skip it
        if (wcZone.id === 0) continue;
      }

      const zoneName = (wcZone.name || `Zona ${wcZone.id}`).trim();

      // Upsert the zone in Prisma
      const dbZone = await prisma.shippingZone.upsert({
        where: { name: zoneName },
        update: { isActive: true },
        create: { name: zoneName, isActive: true }
      });
      importedZonesCount++;

      const zoneMethodsSummary: string[] = [];

      for (const m of (methods || [])) {
        const title = m.settings?.title?.value || m.title || m.method_title || 'Taxa Fixa';
        let rate = 0;
        if (m.settings?.cost?.value) {
          const parsed = parseFloat(String(m.settings.cost.value).replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed)) rate = parsed;
        }

        let minOrderAmount: number | null = null;
        if (m.settings?.min_amount?.value) {
          const parsedMin = parseFloat(String(m.settings.min_amount.value).replace(/[^0-9.]/g, ''));
          if (!isNaN(parsedMin)) minOrderAmount = parsedMin;
        }

        // Upsert or create shipping method
        const existing = await prisma.shippingMethod.findFirst({
          where: { zoneId: dbZone.id, type: title }
        });

        if (existing) {
          await prisma.shippingMethod.update({
            where: { id: existing.id },
            data: {
              rate,
              minOrderAmount,
              isActive: m.enabled !== false
            }
          });
        } else {
          await prisma.shippingMethod.create({
            data: {
              zoneId: dbZone.id,
              type: title,
              rate,
              minOrderAmount,
              isActive: m.enabled !== false
            }
          });
        }
        importedMethodsCount++;
        zoneMethodsSummary.push(`${title}: ${rate}€`);
      }

      importedSummary.push({
        zone: zoneName,
        locations: locationsSummary,
        methods: zoneMethodsSummary
      });
    }

    revalidatePath('/admin/shipping');
    revalidatePath('/checkout');
    return {
      success: true,
      zonesCount: importedZonesCount,
      methodsCount: importedMethodsCount,
      summary: importedSummary
    };
  } catch (error: any) {
    console.error('Error importing WooCommerce shipping:', error);
    return { success: false, message: error.message || 'Erreur lors de l\'import des zones et méthodes de livraison.' };
  }
}

/**
 * Fast SEO synchronizer: Updates only metaTitle, metaDescription and GTIN from RankMath/Yoast
 * without downloading images or re-creating variations. Very fast (100 products per API page).
 */
export async function syncWooCommerceRankMathSEO(
  url: string,
  consumerKey: string,
  consumerSecret: string
) {
  await requireAdmin();

  const baseUrl = url.replace(/\/$/, '');
  const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  let updatedProductsCount = 0;
  let updatedCategoriesCount = 0;
  let totalProductsScanned = 0;

  try {
    // 1. Sync Categories SEO
    const catResponse = await fetch(`${baseUrl}/wp-json/wc/v3/products/categories?per_page=100&hide_empty=false`, {
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (catResponse.ok) {
      const remoteCategories = await catResponse.json();
      if (Array.isArray(remoteCategories)) {
        for (const wcCat of remoteCategories) {
          const catSeo = extractRankMathSEO(wcCat.meta_data, wcCat);
          if (catSeo.metaTitle || catSeo.metaDescription || catSeo.metaKeywords) {
            const cleanName = unescapeHtml(wcCat.name || '').trim();
            const cleanSlug = wcCat.slug;

            const localCat = await prisma.category.findFirst({
              where: {
                OR: [
                  { slug: cleanSlug },
                  { name: cleanName }
                ]
              }
            });

            if (localCat) {
              await prisma.category.update({
                where: { id: localCat.id },
                data: {
                  ...(catSeo.metaTitle ? { metaTitle: catSeo.metaTitle } : {}),
                  ...(catSeo.metaDescription ? { metaDescription: catSeo.metaDescription } : {}),
                  ...(catSeo.metaKeywords ? { metaKeywords: catSeo.metaKeywords } : {}),
                }
              });
              updatedCategoriesCount++;
            }
          }
        }
      }
    }

    // 2. Sync Products SEO (100 per page)
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 20) {
      const prodResponse = await fetch(`${baseUrl}/wp-json/wc/v3/products?per_page=100&page=${page}`, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (!prodResponse.ok) {
        throw new Error(`Erreur API WooCommerce: ${prodResponse.status} ${prodResponse.statusText}`);
      }

      const prods = await prodResponse.json();
      if (!Array.isArray(prods) || prods.length === 0) {
        hasMore = false;
        break;
      }

      totalProductsScanned += prods.length;

      for (const wcProduct of prods) {
        const seo = extractRankMathSEO(wcProduct.meta_data, wcProduct);
        if (seo.metaTitle || seo.metaDescription || seo.gtin) {
          const decodedTitle = unescapeHtml(wcProduct.name || '');
          const rawTitle = wcProduct.name || '';
          const baseSlug = wcProduct.slug;

          const localProduct = await prisma.product.findFirst({
            where: {
              OR: [
                { slug: baseSlug },
                { title: decodedTitle },
                { title: rawTitle },
                ...(baseSlug ? [{ slug: { startsWith: `${baseSlug}-` } }] : [])
              ]
            },
            select: { id: true }
          });

          if (localProduct) {
            await prisma.product.update({
              where: { id: localProduct.id },
              data: {
                ...(seo.metaTitle ? { metaTitle: seo.metaTitle } : {}),
                ...(seo.metaDescription ? { metaDescription: seo.metaDescription } : {}),
                ...(seo.gtin ? { gtin: seo.gtin } : {}),
              }
            });
            updatedProductsCount++;
          }
        }
      }

      page++;
    }

    // 3. Sync WordPress Pages SEO
    let updatedPagesCount = 0;
    try {
      const pageResponse = await fetch(`${baseUrl}/wp-json/wp/v2/pages?per_page=100`, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      if (pageResponse.ok) {
        const remotePages = await pageResponse.json();
        if (Array.isArray(remotePages)) {
          for (const wpPage of remotePages) {
            const pageSeo = extractRankMathSEO(wpPage.meta_data || wpPage.meta, wpPage, 'HLG Hausgeräte');
            const cleanSlug = wpPage.slug;
            const existingPage = await prisma.page.findUnique({ where: { slug: cleanSlug } });
            if (existingPage && (pageSeo.metaTitle || pageSeo.metaDescription || pageSeo.metaKeywords)) {
              await prisma.page.update({
                where: { id: existingPage.id },
                data: {
                  ...(pageSeo.metaTitle ? { metaTitle: pageSeo.metaTitle } : {}),
                  ...(pageSeo.metaDescription ? { metaDescription: pageSeo.metaDescription } : {}),
                  ...(pageSeo.metaKeywords ? { metaKeywords: pageSeo.metaKeywords } : {})
                }
              });
              updatedPagesCount++;
            }
          }
        }
      }
    } catch (pageErr) {
      console.warn('RankMath sync pages skipped or failed:', pageErr);
    }

    // 4. Sync WordPress Blog Articles SEO
    let updatedArticlesCount = 0;
    try {
      const postResponse = await fetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=100`, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      if (postResponse.ok) {
        const remotePosts = await postResponse.json();
        if (Array.isArray(remotePosts)) {
          for (const wpPost of remotePosts) {
            const postSeo = extractRankMathSEO(wpPost.meta_data || wpPost.meta, wpPost, 'HLG Hausgeräte');
            const cleanSlug = wpPost.slug;
            const existingArticle = await prisma.article.findUnique({ where: { slug: cleanSlug } });
            if (existingArticle && (postSeo.metaTitle || postSeo.metaDescription || postSeo.metaKeywords)) {
              await prisma.article.update({
                where: { id: existingArticle.id },
                data: {
                  ...(postSeo.metaTitle ? { metaTitle: postSeo.metaTitle } : {}),
                  ...(postSeo.metaDescription ? { metaDescription: postSeo.metaDescription } : {}),
                  ...(postSeo.metaKeywords ? { metaKeywords: postSeo.metaKeywords } : {})
                }
              });
              updatedArticlesCount++;
            }
          }
        }
      }
    } catch (postErr) {
      console.warn('RankMath sync posts skipped or failed:', postErr);
    }

    revalidatePath('/admin/products');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/pages');
    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    revalidatePath('/sitemap.xml');

    return {
      success: true,
      updatedProductsCount,
      updatedCategoriesCount,
      updatedPagesCount,
      updatedArticlesCount,
      totalProductsScanned,
      message: `SEO-Synchronisierung erfolgreich abgeschlossen! ${updatedProductsCount} Produkte, ${updatedCategoriesCount} Kategorien, ${updatedPagesCount} Seiten und ${updatedArticlesCount} Blogartikel wurden mit den RankMath-Daten aktualisiert.`
    };
  } catch (error: any) {
    console.error('Error syncing RankMath SEO:', error);
    return {
      success: false,
      message: error.message || 'Fehler bei der Synchronisierung der RankMath SEO-Daten.'
    };
  }
}
