import HlgHero from '@/components/home/HlgHero';
import AktuelleAngebote from '@/components/home/AktuelleAngebote';
import CategoryShowcaseSections from '@/components/home/CategoryShowcaseSections';
import BrandShowcase from '@/components/home/BrandShowcase';
import ThermalHero from '@/components/home/ThermalHero';
import Newsletter from '@/components/home/Newsletter';
import PromoBanners from '@/components/home/PromoBanners';
import FullWidthBanner from '@/components/home/FullWidthBanner';
import TrustBar from '@/components/home/TrustBar';
import CategoryExplorer from '@/components/home/CategoryExplorer';
import ShippingSimulator from '@/components/home/ShippingSimulator';
import FeaturedProductTabs from '@/components/home/FeaturedProductTabs';
import HeatingGuideBlogs from '@/components/home/HeatingGuideBlogs';
import prisma from '@/lib/prisma';
import { SectionConfig } from '@/app/admin/(dashboard)/landing/LandingForm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const settings = await import('@/lib/cache').then(m => m.getCachedSettings());

  // Fetch products from Prisma
  let formattedProducts: any[] = [];
  let dbBestsellers: any[] = [];

  try {
    const allDbProds = await prisma.product.findMany({
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

    formattedProducts = allDbProds.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images || [],
      discountLabel: p.discountLabel || (p.compareAtPrice && p.compareAtPrice > p.price ? `-${Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)}%` : null),
      categorySlug: p.categories[0]?.slug || '',
      categoryName: p.categories[0]?.name || '',
      categories: p.categories.map(c => ({ name: c.name, slug: c.slug || '' })),
      allCategories: p.categories.map(c => `${c.name} ${c.slug}`).join(' ')
    }));

    // Dynamic detection of best-selling products:
    // Prioritize isBestSeller flag, then products with valid images and highest interest
    const detectedBestsellers = allDbProds
      .filter(p => p.isBestSeller)
      .concat(allDbProds.filter(p => !p.isBestSeller && p.images && p.images.length > 0))
      .slice(0, 6)
      .map((p, idx) => ({
        id: p.id,
        title: p.title,
        price: `${p.price.toFixed(2).replace('.', ',')}€`,
        rawPrice: p.price,
        image: p.images?.[0] || '/images/deals/bestseller-1.jpg',
        slug: p.slug,
        rank: idx + 1,
        energyRating: p.title.match(/\b([A-G]|\bA\+{1,3})\b/i)?.[1]?.toUpperCase() || undefined,
        rating: 5,
        ratingScore: '(5.00)'
      }));

    if (detectedBestsellers.length > 0) {
      dbBestsellers = detectedBestsellers;
    }
  } catch (e) {
    console.error('Failed to fetch products for homepage:', e);
  }

  const DEFAULT_HLG_SECTIONS: SectionConfig[] = [
    { id: 'sec_hero', type: 'Hero', name: 'Hero Banner & Kategorien', enabled: true, settings: {} },
    { id: 'sec_deals', type: 'AktuelleAngebote', name: 'Aktuelle Angebote & Bestseller', enabled: true, settings: {} },
    { id: 'sec_categories', type: 'CategoryShowcase', name: 'Top-Kategorien (Auswahl)', enabled: true, settings: {} },
    { id: 'sec_brands', type: 'BrandShowcase', name: 'Marken & HLG Garantien', enabled: true, settings: {} },
    { id: 'sec_trust', type: 'TrustBar', name: 'Vertrauensgarantien (TrustBar)', enabled: true, settings: {} },
    { id: 'sec_blogs', type: 'HeatingGuideBlogs', name: 'HLG Magazin & Ratgeber', enabled: true, settings: { title: "HLG Magazin & Ratgeber" } },
    { id: 'sec_newsletter', type: 'Newsletter', name: 'Newsletter', enabled: true, settings: {} }
  ];

  let layout: SectionConfig[] = [];
  try {
    if (settings.HOMEPAGE_LAYOUT) {
      layout = JSON.parse(settings.HOMEPAGE_LAYOUT);
      const hasHlgSections = layout.some(s => s.type === 'AktuelleAngebote' || s.type === 'CategoryShowcase');
      if (!hasHlgSections) {
        layout = DEFAULT_HLG_SECTIONS;
      }
    } else {
      layout = DEFAULT_HLG_SECTIONS;
    }
  } catch (e) {
    console.error('Failed to parse HOMEPAGE_LAYOUT', e);
    layout = DEFAULT_HLG_SECTIONS;
  }

  // Extract best selling products for Hero Showcase Card rotation
  const heroShowcaseProducts = formattedProducts
    .filter(p => p.images && p.images.length > 0)
    .slice(0, 8)
    .map(p => {
      const savings = p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice - p.price : 0;
      const discountPct = p.compareAtPrice && p.compareAtPrice > p.price
        ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
        : null;
      return {
        id: p.id,
        title: p.title,
        subtitle: p.categoryName ? `${p.categoryName} • Höchste Energieeffizienz` : 'Geprüfte HLG Qualität',
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        image: p.images[0],
        badge: discountPct ? `SPAREN -${discountPct}%` : 'BESTSELLER',
        badgeTech: p.categoryName ? `✨ ${p.categoryName}` : '✨ Top Qualität',
        badgeTech2: savings > 0 ? `Sie sparen ${savings.toFixed(2).replace('.', ',')} €` : 'Sofort lieferbar',
        categoryName: p.categoryName || ''
      };
    });

  // Filter only enabled sections
  const activeSections = layout.filter(s => s.enabled);

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'Hero':
        return <HlgHero key={section.id} config={section.settings} />;
      case 'AktuelleAngebote':
      case 'BestDeals':
        return <AktuelleAngebote key={section.id} dbBestsellers={dbBestsellers} config={section.settings} />;
      case 'CategoryShowcase':
        return <CategoryShowcaseSections key={section.id} />;
      case 'BrandShowcase':
        return <BrandShowcase key={section.id} />;
      case 'TrustBar':
        return <TrustBar key={section.id} />;
      case 'CategoryExplorer':
        return <CategoryExplorer key={section.id} />;
      case 'HeatingGuideBlogs':
      case 'LatestBlogs':
        return <HeatingGuideBlogs key={section.id} />;
      case 'Newsletter':
        return <Newsletter key={section.id} config={section.settings} />;
      case 'PromoBanners':
        return <PromoBanners key={section.id} config={section.settings} />;
      case 'FullWidthBanner':
        return <FullWidthBanner key={section.id} config={section.settings} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main>
        {activeSections.map(renderSection)}
      </main>
    </div>
  );
}
