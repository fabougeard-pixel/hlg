import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

import { getContactSettings } from '@/actions/contactSettings';

import { SITE_URL } from '@/lib/site';
import { getCategoryCanonicalPath } from '@/lib/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const contactSettings = await getContactSettings();

  // 1. Pages statiques
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${contactSettings.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sale`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/new`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hot`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  ];

  // 2. Produits dynamiques
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    select: { slug: true, updatedAt: true },
  });

  const productPages = products.map((product) => ({
    url: `${baseUrl}/produkt/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 3. Articles de Blog dynamiques
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const articlePages = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 4. Dynamic categories (Option B: Hierarchical root paths like /combustiveis/lenha-e-pellets)
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true, metaTitle: true, metaDescription: true, metaKeywords: true },
  });

  const categoryPages = await Promise.all(
    categories
      .filter(c => c.slug)
      .map(async (category) => ({
        url: `${baseUrl}${await getCategoryCanonicalPath(category, categories)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
  );

  // 5. CMS Pages
  const pages = await prisma.page.findMany({
    select: { slug: true, updatedAt: true },
  });

  const cmsPages = pages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...articlePages, ...categoryPages, ...cmsPages];
}
