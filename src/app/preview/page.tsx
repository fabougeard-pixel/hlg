import HlgHero from '@/components/home/HlgHero';
import AktuelleAngebote from '@/components/home/AktuelleAngebote';
import CategoryShowcaseSections from '@/components/home/CategoryShowcaseSections';
import BrandShowcase from '@/components/home/BrandShowcase';
import FeaturedProductTabs from '@/components/home/FeaturedProductTabs';
import ShippingSimulator from '@/components/home/ShippingSimulator';
import HeatingGuideBlogs from '@/components/home/HeatingGuideBlogs';
import TrustBar from '@/components/home/TrustBar';
import CategoryExplorer from '@/components/home/CategoryExplorer';
import BestDeals from '@/components/home/BestDeals';
import BestSeller from '@/components/home/BestSeller';
import LatestBlogs from '@/components/home/LatestBlogs';
import Newsletter from '@/components/home/Newsletter';
import PromoBanners from '@/components/home/PromoBanners';
import ProductGrid from '@/components/home/ProductGrid';
import FullWidthBanner from '@/components/home/FullWidthBanner';
import { SectionConfig, SectionType } from '@/app/admin/(dashboard)/landing/LandingForm';
import PreviewSectionWrapper from '@/components/admin/PreviewSectionWrapper';
import { cookies } from 'next/headers';
import { getSettings } from '@/actions/settings';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PreviewPage() {
  const draftLayoutSetting = await prisma.setting.findUnique({ where: { key: 'PREVIEW_LAYOUT_DRAFT' } });
  const draftFontSetting = await prisma.setting.findUnique({ where: { key: 'PREVIEW_FONT_DRAFT' } });

  let layoutCookieStr = draftLayoutSetting?.value || '';
  // We can use the draft font if needed later

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
  if (layoutCookieStr) {
    try {
      layout = JSON.parse(layoutCookieStr);
      const hasHlg = layout.some(s => s.type === 'AktuelleAngebote' || s.type === 'CategoryShowcase');
      if (!hasHlg) layout = DEFAULT_HLG_SECTIONS;
    } catch (e) {
      console.error(e);
      layout = DEFAULT_HLG_SECTIONS;
    }
  } else {
    const settings = await getSettings();
    if (settings.HOMEPAGE_LAYOUT) {
      try {
        layout = JSON.parse(settings.HOMEPAGE_LAYOUT);
        const hasHlg = layout.some(s => s.type === 'AktuelleAngebote' || s.type === 'CategoryShowcase');
        if (!hasHlg) layout = DEFAULT_HLG_SECTIONS;
      } catch {
        layout = DEFAULT_HLG_SECTIONS;
      }
    } else {
      layout = DEFAULT_HLG_SECTIONS;
    }
  }

  const activeSections = layout.filter(s => s.enabled);

  // Fetch thermal products from Prisma
  let formattedProducts: any[] = [];
  let promoProducts: any[] = [];
  let simulatorProducts = {
    pallets: [] as any[],
    fireplaces: [] as any[],
    climate: [] as any[]
  };

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
      allCategories: p.categories.map(c => `${c.name} ${c.slug}`).join(' ')
    }));

    promoProducts = formattedProducts.filter(p => 
      (p.compareAtPrice && p.compareAtPrice > p.price) || 
      (p.discountLabel && p.discountLabel.trim() !== '')
    );

    const classify = (p: any) => {
      const t = p.title.toLowerCase();
      if (
        t.includes('salamandra') ||
        t.includes('recuperador') ||
        t.includes('lareira') ||
        t.includes('fogão') ||
        t.includes('fogao') ||
        t.includes('forno') ||
        t.includes('aquecedor') ||
        t.includes('radiador') ||
        t.includes('caldeira') ||
        t.includes('cozinha') ||
        t.includes('estufa')
      ) {
        return 'fireplaces';
      }
      if (
        t.includes('ar condicionado') ||
        t.includes('split') ||
        t.includes('climatiz') ||
        t.includes('desumidificador') ||
        t.includes('ventilador') ||
        t.includes('termoacumulador')
      ) {
        return 'climate';
      }
      if (
        t.includes('palete') ||
        t.includes('palet') ||
        t.includes('pellet') ||
        t.includes('lenha') ||
        t.includes('big bag') ||
        t.includes('aparas') ||
        t.includes('carvão') ||
        t.includes('carvao') ||
        t.includes('bioetanol') ||
        t.includes('combust')
      ) {
        return 'pallets';
      }
      return 'fireplaces';
    };

    for (const p of allDbProds) {
      const type = classify(p);
      simulatorProducts[type].push({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        image: p.images?.[0] || '',
        categoryName: p.categories?.[0]?.name || '',
        brand: p.brand?.name || undefined,
        sku: p.gtin || undefined
      });
    }
  } catch (e) {
    console.error('Failed to fetch products for preview:', e);
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
        subtitle: p.categoryName ? `${p.categoryName} • Alta Eficiência EcoDesign` : 'Qualidade Garantida Silva Dias',
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        image: p.images[0],
        badge: discountPct ? `POUPANÇA -${discountPct}%` : 'TOP VENDAS',
        badgeTech: p.categoryName ? `🔥 ${p.categoryName}` : '🔥 Alto Rendimento',
        badgeTech2: savings > 0 ? `Poupe ${savings.toFixed(2).replace('.', ',')} €` : 'Stock Garantido',
        categoryName: p.categoryName || ''
      };
    });

  const renderSection = (section: SectionConfig) => {
    let content = null;
    switch (section.type) {
      case 'Hero':
        content = <HlgHero config={section.settings} />;
        break;
      case 'AktuelleAngebote':
      case 'BestDeals':
        content = <AktuelleAngebote />;
        break;
      case 'CategoryShowcase':
        content = <CategoryShowcaseSections />;
        break;
      case 'BrandShowcase':
        content = <BrandShowcase />;
        break;
      case 'TrustBar':
        content = <TrustBar />;
        break;
      case 'CategoryExplorer':
        content = <CategoryExplorer />;
        break;
      case 'HeatingGuideBlogs':
      case 'LatestBlogs':
        content = <HeatingGuideBlogs />;
        break;
      case 'Newsletter':
        content = <Newsletter config={section.settings} />;
        break;
      case 'PromoBanners':
        content = <PromoBanners config={section.settings} />;
        break;
      case 'FullWidthBanner':
        content = <FullWidthBanner config={section.settings} />;
        break;
      default:
        return null;
    }

    return (
      <PreviewSectionWrapper key={section.id} sectionId={section.id} sectionName={section.name || section.type}>
        {content}
      </PreviewSectionWrapper>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <main>
        {activeSections.length > 0 ? activeSections.map(renderSection) : (
          <div className="flex items-center justify-center h-64 text-gray-500">No active sections.</div>
        )}
      </main>
    </div>
  );
}
