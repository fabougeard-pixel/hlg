'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import HeroPreviewEditButton from '@/components/admin/HeroPreviewEditButton';

interface CategoryItem {
  name: string;
  slug: string;
  icon?: string;
}

const defaultApplianceCategories: CategoryItem[] = [
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Geschirrspüler', slug: 'geschirrspueler' },
  { name: 'Herde', slug: 'herde' },
  { name: 'Kaffeemaschinen', slug: 'kaffeemaschinen' },
  { name: 'Küchenmaschinen', slug: 'kuechenmaschinen' },
  { name: 'Kühlen & Gefrieren', slug: 'kuehlen-gefrieren' },
  { name: 'Staubsauger & Reiniger', slug: 'staubsauger-reiniger' },
  { name: 'Waschmaschinen', slug: 'waschmaschinen' },
];

export interface HlgHeroProps {
  config?: any;
  categories?: Array<{ id?: string; name: string; slug: string | null }>;
  isPreview?: boolean;
  sectionId?: string;
}

function hexToRgba(hex: string, alphaPercent: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return `rgba(255,255,255,${alphaPercent / 100})`;
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alphaPercent / 100))})`;
}

export default function HlgHero({
  config = {},
  categories = [],
  isPreview = false,
  sectionId,
}: HlgHeroProps) {
  const [mounted, setMounted] = useState(false);
  const cartStore = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItems = cartStore.getTotalItems();
  const cartTotal = cartStore.getTotalPrice();

  // Global Hero settings
  const heroMinHeight = Number(config?.heroMinHeight) || 460;
  const heroPaddingY = config?.heroPaddingY !== undefined ? Number(config.heroPaddingY) : 24;
  const heroGap = config?.heroGap !== undefined ? Number(config.heroGap) : 20;
  const heroBgColor = config?.heroBgColor || 'transparent';
  const showMiniCart = config?.showMiniCart !== false;
  const showMobileCategories = config?.showMobileCategories !== false;

  // Block 1 settings (Categories)
  const block1MaxItems = Math.max(3, Math.min(12, Number(config?.block1MaxItems) || 8));
  const block1Title = config?.block1Title ?? 'Alle Kategorien';
  const block1FooterText = config?.block1FooterText ?? 'Alle Kategorien ansehen';
  const block1FooterUrl = config?.block1FooterUrl ?? '/shop';
  const block1BgColor = config?.block1BgColor || '#ffffff';
  const block1BorderColor = config?.block1BorderColor || '#e7e5e4';
  const block1BorderRadius = config?.block1BorderRadius !== undefined ? Number(config.block1BorderRadius) : 16;
  const block1AccentColor = config?.block1AccentColor || '#107b46';
  const block1TitleColor = config?.block1TitleColor || '#1c1917';
  const block1TitleSize = config?.block1TitleSize !== undefined ? Number(config.block1TitleSize) : 14;
  const block1TextColor = config?.block1TextColor || '#44403c';

  const displayCategories =
    categories && categories.length > 0
      ? categories.slice(0, block1MaxItems).map((c) => ({ name: c.name, slug: c.slug || '' }))
      : defaultApplianceCategories.slice(0, block1MaxItems);

  // Block 2 settings (Main Banner)
  const block2Image =
    config?.bannerImage !== undefined
      ? config.bannerImage
      : config?.bgImageUrl !== undefined
        ? config.bgImageUrl
        : '/images/hero-appliances.jpg';
  const block2BadgeText = config?.badgeText ?? config?.campaignBadge ?? 'Sonderangebot';
  const block2Title =
    config?.title ??
    config?.titleGradient ??
    'Ihre hochwertigen Haushaltsgeräte zu den besten Preisen!';
  const block2Subtitle =
    config?.subtitle ??
    config?.description ??
    'Premium-Marken für Küche & Haushalt. Bis zu 40% sparen • Sofort versandbereit • 2 Jahre Garantie.';
  const block2Trust1 = config?.trustBadge1 ?? 'Kostenloser Versand ab 50 €';
  const block2Trust2 = config?.trustBadge2 ?? '2 Jahre Garantie';
  const block2CtaText = config?.ctaText ?? config?.buttonText ?? 'Angebote anzeigen';
  const block2CtaUrl = config?.ctaUrl ?? config?.buttonLink ?? '/shop';

  const block2BgColor = config?.block2BgColor || '#f5f5f4';
  const block2BorderRadius = config?.block2BorderRadius !== undefined ? Number(config.block2BorderRadius) : 16;
  const block2Padding = config?.block2Padding !== undefined ? Number(config.block2Padding) : 28;
  const block2OverlayColor = config?.block2OverlayColor || '#ffffff';
  const block2OverlayOpacity = config?.block2OverlayOpacity !== undefined ? Number(config.block2OverlayOpacity) : 85;
  const block2CardBgOpacity = config?.block2CardBgOpacity !== undefined ? Number(config.block2CardBgOpacity) : 75;
  const block2BadgeBg = config?.block2BadgeBg || '#e01b1b';
  const block2BadgeTextColor = config?.block2BadgeTextColor || '#ffffff';
  const block2TitleColor = config?.block2TitleColor || '#dc2626';
  const block2TitleSize = config?.block2TitleSize !== undefined ? Number(config.block2TitleSize) : 34;
  const block2SubtitleColor = config?.block2SubtitleColor || '#44403c';
  const block2SubtitleSize = config?.block2SubtitleSize !== undefined ? Number(config.block2SubtitleSize) : 14;
  const block2BtnBg = config?.block2BtnBg || '#f59e0b';
  const block2BtnTextColor = config?.block2BtnTextColor || '#0c0a09';

  // Block 3 settings (Right Highlight Card)
  const block3Image =
    config?.sideCardImage !== undefined
      ? config.sideCardImage
      : config?.showcaseBgImage !== undefined
        ? config.showcaseBgImage
        : '/images/hero-coffee-machine.jpg';
  const block3Badge = config?.sideCardBadge ?? '★ Bestseller der Woche';
  const block3Category = config?.sideCardCategory ?? 'Genuss auf Knopfdruck';
  const block3Title = config?.sideCardTitle ?? 'Kaffeevollautomaten';
  const block3Subtitle =
    config?.sideCardSubtitle ??
    'Perfekter Barista-Kaffee für Ihr Zuhause mit intuitiver Touch-Bedienung.';
  const block3CtaText = config?.sideCardCtaText ?? 'Geräte entdecken';
  const block3Url = config?.sideCardUrl ?? '/shop?category=kaffeemaschinen';

  const block3BgColor = config?.block3BgColor || '#1c1917';
  const block3BorderRadius = config?.block3BorderRadius !== undefined ? Number(config.block3BorderRadius) : 16;
  const block3OverlayOpacity = config?.block3OverlayOpacity !== undefined ? Number(config.block3OverlayOpacity) : 90;
  const block3BadgeBg = config?.block3BadgeBg || '#ffffff';
  const block3BadgeTextColor = config?.block3BadgeTextColor || '#1c1917';
  const block3CategoryColor = config?.block3CategoryColor || '#fbbf24';
  const block3TitleColor = config?.block3TitleColor || '#ffffff';
  const block3TitleSize = config?.block3TitleSize !== undefined ? Number(config.block3TitleSize) : 18;
  const block3SubtitleColor = config?.block3SubtitleColor || '#d6d3d1';
  const block3LinkColor = config?.block3LinkColor || '#fbbf24';

  const previewRing = isPreview
    ? 'hover:ring-2 hover:ring-[#107b46]/80 transition-shadow duration-200'
    : '';

  return (
    <section
      style={{
        paddingTop: `${heroPaddingY}px`,
        paddingBottom: `${heroPaddingY}px`,
        backgroundColor: heroBgColor,
      }}
      className="relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Floating Mini-Cart Widget */}
        {showMiniCart && !isPreview && (
          <div className="fixed right-4 sm:right-6 top-28 sm:top-32 z-40">
            <button
              type="button"
              onClick={() => cartStore.setIsOpen(true)}
              className="bg-[#107b46] hover:bg-[#0d693b] text-white shadow-xl hover:shadow-2xl rounded-2xl px-3.5 py-3 flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 group cursor-pointer border-2 border-white/80"
              title="Warenkorb ansehen"
            >
              <div className="relative mb-1">
                <svg
                  className="w-6 h-6 text-white group-hover:rotate-6 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <span className="text-[11px] font-bold tracking-tight leading-tight">
                {mounted ? cartItems : 0} {cartItems === 1 ? 'Produkt' : 'Produkte'}
              </span>
              <span className="text-xs font-black mt-0.5 bg-black/20 px-2 py-0.5 rounded-full">
                {mounted ? cartTotal.toFixed(2).replace('.', ',') : '0,00'} €
              </span>
            </button>
          </div>
        )}

        {/* Main Grid: Block 1 (Categories) + Block 2 (Center Banner) + Block 3 (Highlight Card) */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 items-stretch"
          style={{ gap: `${heroGap}px` }}
        >
          {/* 1. BLOCK 1: Left Categories Column */}
          <div
            className={`hidden lg:block lg:col-span-3 relative group/block ${previewRing}`}
            style={{ borderRadius: `${block1BorderRadius}px` }}
          >
            {isPreview && sectionId && (
              <HeroPreviewEditButton sectionId={sectionId} blockNum={1} label="Block 1: Kategorien" />
            )}

            <div
              className="shadow-sm h-full flex flex-col overflow-hidden border"
              style={{
                backgroundColor: block1BgColor,
                borderColor: block1BorderColor,
                borderRadius: `${block1BorderRadius}px`,
              }}
            >
              {/* Header with Accent Indicator */}
              <div className="px-5 pt-4 pb-3 border-b border-stone-100">
                <h3
                  className="font-extrabold tracking-tight"
                  style={{ color: block1TitleColor, fontSize: `${block1TitleSize}px` }}
                >
                  {block1Title}
                </h3>
                <div
                  className="w-8 h-0.5 rounded-full mt-1.5"
                  style={{ backgroundColor: block1AccentColor }}
                />
              </div>

              {/* Category List */}
              <nav className="flex-1 divide-y divide-stone-100/90 text-xs sm:text-sm font-medium">
                {displayCategories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                    className="group/item flex items-center justify-between px-5 py-3 hover:bg-emerald-50/60 transition-colors"
                  >
                    <span
                      className="group-hover/item:font-semibold transition-colors truncate"
                      style={{ color: block1TextColor }}
                    >
                      {cat.name}
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-stone-300 group-hover/item:translate-x-0.5 transition-all shrink-0 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </nav>

              {/* Footer link */}
              {block1FooterText && (
                <div className="p-3 bg-stone-50/80 border-t border-stone-100 text-center">
                  <Link
                    href={block1FooterUrl || '/shop'}
                    className="text-xs font-bold hover:underline inline-flex items-center gap-1"
                    style={{ color: block1AccentColor }}
                  >
                    <span>{block1FooterText}</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 2. BLOCK 2: Center Main Banner */}
          <div
            className={`lg:col-span-6 xl:col-span-6 relative overflow-hidden shadow-sm border border-stone-200/80 flex items-center group/block ${previewRing}`}
            style={{
              minHeight: `${heroMinHeight}px`,
              backgroundColor: block2BgColor,
              borderRadius: `${block2BorderRadius}px`,
            }}
          >
            {isPreview && sectionId && (
              <HeroPreviewEditButton sectionId={sectionId} blockNum={2} label="Block 2: Hauptbanner" />
            )}

            {/* Background Image */}
            {block2Image && (
              <Image
                src={block2Image}
                alt={block2Title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 660px"
                quality={90}
                className="object-cover object-center transition-transform duration-700"
              />
            )}

            {/* Gradient Overlay for legibility */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${hexToRgba(block2OverlayColor, block2OverlayOpacity)} 0%, ${hexToRgba(block2OverlayColor, Math.round(block2OverlayOpacity * 0.78))} 55%, rgba(255,255,255,0) 100%)`,
              }}
            />

            {/* Banner Content Card */}
            <div className="relative z-10 max-w-xl" style={{ padding: `${block2Padding}px` }}>
              <div
                className="backdrop-blur-[2px] rounded-2xl p-4 sm:p-5 shadow-xs border border-white/80 max-w-lg"
                style={{ backgroundColor: `rgba(255, 255, 255, ${block2CardBgOpacity / 100})` }}
              >
                {/* Badge */}
                {block2BadgeText && (
                  <div className="inline-flex items-center shadow-xs">
                    <span
                      className="relative text-[11px] sm:text-xs font-black tracking-wider uppercase px-3.5 py-1 rounded-sm shadow-sm flex items-center gap-1.5"
                      style={{ backgroundColor: block2BadgeBg, color: block2BadgeTextColor }}
                    >
                      <span className="text-amber-300">⚡</span>
                      <span>{block2BadgeText}</span>
                    </span>
                  </div>
                )}

                {/* Main Title */}
                <h1
                  className="font-black leading-[1.15] tracking-tight mt-3"
                  style={{
                    color: block2TitleColor,
                    fontSize: `clamp(1.35rem, 2.5vw, ${block2TitleSize}px)`,
                  }}
                >
                  {block2Title}
                </h1>

                {/* Subtitle */}
                {block2Subtitle && (
                  <p
                    className="font-semibold mt-2 max-w-md leading-relaxed"
                    style={{
                      color: block2SubtitleColor,
                      fontSize: `${block2SubtitleSize}px`,
                    }}
                  >
                    {block2Subtitle}
                  </p>
                )}

                {/* Trust Micro-Bullets */}
                {(block2Trust1 || block2Trust2) && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-stone-600">
                    {block2Trust1 && (
                      <span className="inline-flex items-center gap-1 text-[#107b46]">
                        <span>✓</span> <span className="text-stone-700">{block2Trust1}</span>
                      </span>
                    )}
                    {block2Trust2 && (
                      <span className="inline-flex items-center gap-1 text-[#107b46]">
                        <span>✓</span> <span className="text-stone-700">{block2Trust2}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* CTA Button */}
                {block2CtaText && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href={block2CtaUrl || '/shop'}
                      className="font-extrabold text-sm sm:text-base px-7 py-3 rounded-full inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      style={{
                        backgroundColor: block2BtnBg,
                        color: block2BtnTextColor,
                      }}
                    >
                      <span>{block2CtaText}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. BLOCK 3: Right Highlight Card */}
          <div
            className={`lg:col-span-3 hidden lg:flex flex-col relative overflow-hidden shadow-sm border border-stone-200/80 group/block ${previewRing}`}
            style={{
              minHeight: `${heroMinHeight}px`,
              backgroundColor: block3BgColor,
              borderRadius: `${block3BorderRadius}px`,
            }}
          >
            {isPreview && sectionId && (
              <HeroPreviewEditButton sectionId={sectionId} blockNum={3} label="Block 3: Highlight" />
            )}

            {/* Background Image */}
            {block3Image && (
              <Image
                src={block3Image}
                alt={block3Title}
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                quality={90}
                className="object-cover object-center transition-transform duration-700"
              />
            )}

            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(to top, rgba(12, 10, 9, ${block3OverlayOpacity / 100}) 0%, rgba(12, 10, 9, ${Math.round(block3OverlayOpacity * 0.35) / 100}) 50%, rgba(12, 10, 9, 0) 100%)`,
              }}
            />

            {/* Top Badge */}
            {block3Badge && (
              <div className="relative z-10 p-5 pr-12">
                <span
                  className="inline-block backdrop-blur-sm font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md"
                  style={{ backgroundColor: block3BadgeBg, color: block3BadgeTextColor }}
                >
                  {block3Badge}
                </span>
              </div>
            )}

            {/* Bottom Card Content */}
            <div className="relative z-10 mt-auto p-5 text-white">
              {block3Category && (
                <span
                  className="text-[11px] font-bold uppercase tracking-wider block"
                  style={{ color: block3CategoryColor }}
                >
                  {block3Category}
                </span>
              )}
              <h4
                className="font-black tracking-tight leading-tight mt-1"
                style={{ color: block3TitleColor, fontSize: `${block3TitleSize}px` }}
              >
                {block3Title}
              </h4>
              {block3Subtitle && (
                <p
                  className="text-xs mt-1 line-clamp-2"
                  style={{ color: block3SubtitleColor }}
                >
                  {block3Subtitle}
                </p>
              )}
              {block3CtaText && (
                <Link
                  href={block3Url || '/shop?category=kaffeemaschinen'}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity"
                  style={{ color: block3LinkColor }}
                >
                  <span>{block3CtaText}</span>
                  <span>&rarr;</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Category Quick Carousel */}
        {showMobileCategories && (
          <div className="mt-4 lg:hidden">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {displayCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                  className="bg-white border border-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-xs hover:border-[#107b46] hover:text-[#107b46] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
